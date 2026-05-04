import { legacySysconf } from '../vendor/legacy-sysconf';
import { legacyUiDef } from '../vendor/legacy-ui-def';
import { legacyBaseUtils } from '../vendor/legacy-utils';
import { getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';

type ScrollbarValues = {
  offset: number;
  left: number;
  viewWidth: number;
  contentWidth: number;
  trackWidth: number;
  thumbWidth: number;
  scrollWidth: number;
};

type ScrollbarWidgets = {
  leftButton: HTMLDivElement;
  rightButton: HTMLDivElement;
  track: HTMLDivElement;
  thumb: HTMLDivElement;
  thumbBody: HTMLDivElement;
};

type CursorLocation = {
  x: number;
};

type ScrollbarUiComponent = {
  scrollbarContainer: HTMLDivElement;
};

type ScrollbarInstance = {
  uiComponent: ScrollbarUiComponent;
  kfEditor: LegacyEditorInstance;
  widgets: ScrollbarWidgets | null;
  container: HTMLDivElement;
  state: boolean;
  values: ScrollbarValues;
  thumbLocationX: number;
  leftOverflow: number;
  rightOverflow: number;
  isExpand: boolean;
  updateHandler: (proportion: number, offset: number, values: ScrollbarValues) => void;
  initWidget: () => void;
  initSize: () => void;
  initServices: () => void;
  initEvent: () => void;
  mountWidget: () => void;
  show: () => void;
  hide: () => void;
  update: (contentWidth: number) => void;
  setUpdateHandler: (updateHandler: ScrollbarInstance['updateHandler']) => void;
  updateOffset: (offset: number) => void;
  relocation: () => void;
};

const SCROLLBAR_DEF = legacyUiDef.scrollbar;
const SCROLLBAR_CONF = legacySysconf.scrollbar;
const CLASS_PREFIX = 'kf-editor-ui-';
const kity = getLegacyKity();

function createElement(doc: Document, eleName: string, className: string) {
  const node = doc.createElement(eleName) as HTMLDivElement;
  const str = '<div class="$1"></div><div class="$2"></div>';

  node.className = CLASS_PREFIX + className;

  if (className === 'thumb') {
    const thumbClassName = CLASS_PREFIX + className;
    node.innerHTML = str.replace('$1', `${thumbClassName}-left`).replace('$2', `${thumbClassName}-right`);
  }

  return node;
}

function preventDefault(comp: ScrollbarInstance) {
  legacyBaseUtils.addEvent(comp.container, 'mousedown', (e: Event) => {
    e.preventDefault();
  });
}

function trackClick(comp: ScrollbarInstance) {
  legacyBaseUtils.addEvent(comp.widgets!.track, 'mousedown', function (this: HTMLDivElement, e: MouseEvent) {
    trackClickHandler(this, comp, e);
  });
}

function btnClick(comp: ScrollbarInstance) {
  legacyBaseUtils.addEvent(comp.widgets!.leftButton, 'mousedown', () => {
    setThumbOffsetByStep(comp, -SCROLLBAR_CONF.step);
  });

  legacyBaseUtils.addEvent(comp.widgets!.rightButton, 'mousedown', () => {
    setThumbOffsetByStep(comp, SCROLLBAR_CONF.step);
  });
}

function thumbHandler(comp: ScrollbarInstance) {
  let isMoving = false;
  let startPoint = 0;
  let startOffset = 0;
  const trackWidth = comp.values.trackWidth;

  legacyBaseUtils.addEvent(comp.widgets!.thumb, 'mousedown', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isMoving = true;
    startPoint = e.clientX;
    startOffset = comp.thumbLocationX;
  });

  legacyBaseUtils.addEvent(comp.container.ownerDocument, 'mouseup', () => {
    isMoving = false;
    startPoint = 0;
    startOffset = 0;
  });

  legacyBaseUtils.addEvent(comp.container.ownerDocument, 'mousemove', (e: MouseEvent) => {
    if (!isMoving) {
      return;
    }

    const distance = e.clientX - startPoint;
    let offset = startOffset + distance;
    const thumbWidth = comp.values.thumbWidth;

    if (offset < 0) {
      offset = 0;
    } else if (offset + thumbWidth > trackWidth) {
      offset = trackWidth - thumbWidth;
    }

    setThumbLocation(comp, offset);
  });
}

function trackClickHandler(track: HTMLDivElement, comp: ScrollbarInstance, evt: MouseEvent) {
  const trackRect = legacyBaseUtils.getRect(track);
  const values = comp.values;
  const unitOffset = (values.viewWidth / (values.contentWidth - values.viewWidth)) * values.trackWidth;
  const clickOffset = evt.clientX - trackRect.left;

  if (clickOffset > values.offset) {
    if (values.offset + unitOffset > values.trackWidth) {
      setThumbOffset(comp, values.trackWidth);
    } else {
      setThumbOffset(comp, values.offset + unitOffset);
    }
    return;
  }

  if (values.offset - unitOffset < 0) {
    setThumbOffset(comp, 0);
  } else {
    setThumbOffset(comp, values.offset - unitOffset);
  }
}

function setThumbLocation(comp: ScrollbarInstance, locationX: number) {
  const values = comp.values;
  const trackPieceWidth = values.trackWidth - values.thumbWidth;
  const offset = Math.floor((locationX / trackPieceWidth) * values.trackWidth);

  comp.updateOffset(offset);
  comp.thumbLocationX = locationX;
  comp.widgets!.thumb.style.left = `${locationX}px`;
}

function setThumbOffsetByStep(comp: ScrollbarInstance, step: number) {
  let leftOverflow = comp.leftOverflow + step;

  if (leftOverflow < 0) {
    leftOverflow = 0;
  } else if (leftOverflow > comp.values.scrollWidth) {
    leftOverflow = comp.values.scrollWidth;
  }

  setThumbByLeftOverflow(comp, leftOverflow);
}

function setThumbOffset(comp: ScrollbarInstance, offset: number) {
  const values = comp.values;
  const offsetProportion = offset / values.trackWidth;
  const trackPieceWidth = values.trackWidth - values.thumbWidth;
  let thumbLocationX = Math.floor(offsetProportion * trackPieceWidth);

  if (offset < 0) {
    offset = 0;
    thumbLocationX = 0;
  }

  comp.updateOffset(offset);
  comp.widgets!.thumb.style.left = `${thumbLocationX}px`;
  comp.thumbLocationX = thumbLocationX;
}

function setThumbOffsetByViewOffset(comp: ScrollbarInstance, viewOffset: number) {
  const values = comp.values;
  const offsetProportion = viewOffset / (values.contentWidth - values.viewWidth);
  const offset = Math.floor(offsetProportion * values.trackWidth);

  setThumbOffset(comp, offset);
}

function setThumbByLeftOverflow(comp: ScrollbarInstance, leftViewOverflow: number) {
  const values = comp.values;
  const overflowProportion = leftViewOverflow / (values.contentWidth - values.viewWidth);

  setThumbOffset(comp, overflowProportion * values.trackWidth);
}

const Scrollbar = kity.createClass('Scrollbar', {
  constructor(this: ScrollbarInstance, uiComponent: ScrollbarUiComponent, kfEditor: LegacyEditorInstance) {
    this.uiComponent = uiComponent;
    this.kfEditor = kfEditor;
    this.widgets = null;
    this.container = this.uiComponent.scrollbarContainer;
    this.state = false;
    this.values = {
      offset: 0,
      left: 0,
      viewWidth: 0,
      contentWidth: 0,
      trackWidth: 0,
      thumbWidth: 0,
      scrollWidth: 0,
    };
    this.thumbLocationX = 0;
    this.leftOverflow = 0;
    this.rightOverflow = 0;
    this.isExpand = true;

    this.initWidget();
    this.mountWidget();
    this.initSize();

    this.hide();
    this.initServices();
    this.initEvent();

    this.updateHandler = function () {};
  },

  initWidget(this: ScrollbarInstance) {
    const doc = this.container.ownerDocument;

    this.widgets = {
      leftButton: createElement(doc, 'div', 'left-button'),
      rightButton: createElement(doc, 'div', 'right-button'),
      track: createElement(doc, 'div', 'track'),
      thumb: createElement(doc, 'div', 'thumb'),
      thumbBody: createElement(doc, 'div', 'thumb-body'),
    };
  },

  initSize(this: ScrollbarInstance) {
    const leftBtnWidth = legacyBaseUtils.getRect(this.widgets!.leftButton).width;
    const rightBtnWidth = legacyBaseUtils.getRect(this.widgets!.rightButton).width;

    this.values.viewWidth = legacyBaseUtils.getRect(this.container).width;
    this.values.trackWidth = this.values.viewWidth - leftBtnWidth - rightBtnWidth;

    this.widgets!.track.style.width = `${this.values.trackWidth}px`;
  },

  initServices(this: ScrollbarInstance) {
    this.kfEditor.registerService('ui.show.scrollbar', this, {
      showScrollbar: this.show,
    });
    this.kfEditor.registerService('ui.hide.scrollbar', this, {
      hideScrollbar: this.hide,
    });
    this.kfEditor.registerService('ui.update.scrollbar', this, {
      updateScrollbar: this.update,
    });
    this.kfEditor.registerService('ui.set.scrollbar.update.handler', this, {
      setUpdateHandler: this.setUpdateHandler,
    });
    this.kfEditor.registerService('ui.relocation.scrollbar', this, {
      relocation: this.relocation,
    });
  },

  initEvent(this: ScrollbarInstance) {
    preventDefault(this);
    trackClick(this);
    thumbHandler(this);
    btnClick(this);
  },

  mountWidget(this: ScrollbarInstance) {
    const widgets = this.widgets!;
    const container = this.container;

    for (const wgtName in widgets) {
      if (Object.prototype.hasOwnProperty.call(widgets, wgtName)) {
        container.appendChild(widgets[wgtName as keyof ScrollbarWidgets]);
      }
    }

    widgets.thumb.appendChild(widgets.thumbBody);
    widgets.track.appendChild(widgets.thumb);
  },

  show(this: ScrollbarInstance) {
    this.state = true;
    this.container.style.display = 'block';
  },

  hide(this: ScrollbarInstance) {
    this.state = false;
    this.container.style.display = 'none';
  },

  update(this: ScrollbarInstance, contentWidth: number) {
    const trackWidth = this.values.trackWidth;

    this.isExpand = contentWidth > this.values.contentWidth;
    this.values.contentWidth = contentWidth;
    this.values.scrollWidth = contentWidth - this.values.viewWidth;

    if (trackWidth >= contentWidth) {
      this.hide();
      return;
    }

    const thumbWidth = Math.max(Math.ceil((trackWidth * trackWidth) / contentWidth), SCROLLBAR_DEF.thumbMinSize);

    this.values.thumbWidth = thumbWidth;
    this.widgets!.thumb.style.width = `${thumbWidth}px`;
    this.widgets!.thumbBody.style.width = `${thumbWidth - 10}px`;
  },

  setUpdateHandler(this: ScrollbarInstance, updateHandler: ScrollbarInstance['updateHandler']) {
    this.updateHandler = updateHandler;
  },

  updateOffset(this: ScrollbarInstance, offset: number) {
    const values = this.values;

    values.offset = offset;
    values.left = offset / values.trackWidth;

    this.leftOverflow = values.left * (values.contentWidth - values.viewWidth);
    this.rightOverflow = values.contentWidth - values.viewWidth - this.leftOverflow;

    this.updateHandler(values.left, values.offset, values);
  },

  relocation(this: ScrollbarInstance) {
    const cursorLocation = this.kfEditor.requestService('control.get.cursor.location') as CursorLocation;
    const padding = SCROLLBAR_CONF.padding;
    const contentWidth = this.values.contentWidth;
    const viewWidth = this.values.viewWidth;
    const viewLeftOverflow = this.values.left * (contentWidth - viewWidth);

    if (cursorLocation.x < viewLeftOverflow) {
      if (cursorLocation.x < 0) {
        cursorLocation.x = 0;
      }

      setThumbOffsetByViewOffset(this, cursorLocation.x);
      return;
    }

    if (cursorLocation.x + padding > viewLeftOverflow + viewWidth) {
      cursorLocation.x += padding;

      if (cursorLocation.x > contentWidth) {
        cursorLocation.x = contentWidth;
      }

      const diff = cursorLocation.x - viewWidth;
      setThumbOffsetByViewOffset(this, diff);
      return;
    }

    if (this.isExpand) {
      setThumbByLeftOverflow(this, this.leftOverflow);
    } else {
      setThumbByLeftOverflow(this, contentWidth - viewWidth - this.rightOverflow);
    }
  },
});

export default Scrollbar as new (uiComponent: ScrollbarUiComponent, kfEditor: LegacyEditorInstance) => ScrollbarInstance;
