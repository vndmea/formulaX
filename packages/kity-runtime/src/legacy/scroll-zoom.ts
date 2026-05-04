import { legacyBaseUtils } from '../vendor/legacy-utils';
import { getLegacyKity } from '../vendor/runtime-interop';
import type { LegacyEditorInstance } from './editor';

type ScrollZoomOptions = {
  min: number;
  max: number;
};

type ScrollZoomComponentInstance = {
  kfEditor: LegacyEditorInstance;
  target: EventTarget | null;
  zoom: number;
  step: number;
  options: ScrollZoomOptions;
  initEvent: () => void;
};

const DEFAULT_OPTIONS: ScrollZoomOptions = {
  min: 1,
  max: 2,
};

const kity = getLegacyKity();

const ScrollZoomController = kity.createClass('ScrollZoomController', {
  constructor(
    this: ScrollZoomComponentInstance,
    _parentComponent: unknown,
    kfEditor: LegacyEditorInstance,
    target: EventTarget | null,
    options?: Partial<ScrollZoomOptions>,
  ) {
    this.kfEditor = kfEditor;
    this.target = target;
    this.zoom = 1;
    this.step = 0.05;
    this.options = legacyBaseUtils.extend({}, DEFAULT_OPTIONS, options) as ScrollZoomOptions;
    this.initEvent();
  },

  initEvent(this: ScrollZoomComponentInstance) {
    const min = this.options.min;
    const max = this.options.max;
    const step = this.step;

    if (!this.target) return;

    legacyBaseUtils.addEvent(this.target, 'mousewheel', (e: Event & { wheelDelta?: number }) => {
      e.preventDefault();

      if ((e.wheelDelta ?? 0) < 0) {
        this.zoom -= this.zoom * step;
      } else {
        this.zoom += this.zoom * step;
      }

      this.zoom = Math.max(this.zoom, min);
      this.zoom = Math.min(this.zoom, max);

      this.kfEditor.requestService('render.set.canvas.zoom', this.zoom);
    });
  },
});

export default ScrollZoomController as new (
  parentComponent: unknown,
  kfEditor: LegacyEditorInstance,
  target: EventTarget | null,
  options?: Partial<ScrollZoomOptions>,
) => ScrollZoomComponentInstance;
