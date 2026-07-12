import { createKityUiUtils } from '../../kity-compat/ui-utils';
import { getKityGraphicsRuntime } from '../../kity-compat/runtime-context';

type DelimiterInstance = {
  doc: Document;
  element: HTMLDivElement;
  setToolbar: (_toolbar: unknown) => void;
  createDilimiter: () => HTMLDivElement;
  attachTo: (container: HTMLElement) => void;
};

const PREFIX = 'kf-editor-ui-';
const $$ = createKityUiUtils();
const kity = getKityGraphicsRuntime();

const Delimiter = kity.createClass('Delimiter', {
  constructor(this: DelimiterInstance, doc: Document) {
    this.doc = doc;
    this.element = this.createDilimiter();
  },

  setToolbar(this: DelimiterInstance, _toolbar: unknown) {},

  createDilimiter(this: DelimiterInstance) {
    const dilimiterNode = $$.ele(this.doc, 'div', {
      className: `${PREFIX}delimiter`,
    }) as HTMLDivElement;

    dilimiterNode.appendChild(
      $$.ele(this.doc, 'div', {
        className: `${PREFIX}delimiter-line`,
      }) as HTMLDivElement,
    );

    return dilimiterNode;
  },

  attachTo(this: DelimiterInstance, container: HTMLElement) {
    container.appendChild(this.element);
  },
});

export default Delimiter as new (doc: Document) => DelimiterInstance;
