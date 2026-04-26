import { getPosition, isInside } from './position';

export type PopupCloseHandler = () => void;

export interface PopupOptions {
  content: HTMLElement;
  anchor: HTMLElement;
  onClose?: PopupCloseHandler;
}

class Popup {
  private container: HTMLElement;
  private overlay: HTMLElement;
  private options: PopupOptions;
  private boundHandleClick: (e: MouseEvent) => void;
  private boundHandleScroll: () => void;
  private boundHandleResize: () => void;

  constructor(options: PopupOptions) {
    this.options = options;
    this.overlay = document.createElement('div');
    this.overlay.className = 'kity-toolbar-popup-overlay';
    this.container = document.createElement('div');
    this.container.className = 'kity-toolbar-popup';
    this.container.appendChild(options.content);

    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleScroll = this.handleScroll.bind(this);
    this.boundHandleResize = this.handleResize.bind(this);

    this.render();
  }

  private render(): void {
    const pos = getPosition(this.options.anchor, this.container);
    this.container.style.top = `${pos.top}px`;
    this.container.style.left = `${pos.left}px`;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.container);

    requestAnimationFrame(() => {
      document.addEventListener('click', this.boundHandleClick);
      window.addEventListener('scroll', this.boundHandleScroll, true);
      window.addEventListener('resize', this.boundHandleResize);
    });
  }

  private handleClick(e: MouseEvent): void {
    const point = { x: e.clientX, y: e.clientY };
    if (!isInside(this.container, point) && !isInside(this.options.anchor, point)) {
      this.close();
    }
  }

  private handleScroll(): void {
    this.close();
  }

  private handleResize(): void {
    this.close();
  }

  close(): void {
    document.removeEventListener('click', this.boundHandleClick);
    window.removeEventListener('scroll', this.boundHandleScroll, true);
    window.removeEventListener('resize', this.boundHandleResize);

    this.overlay.remove();
    this.container.remove();

    if (this.options.onClose) {
      this.options.onClose();
    }
  }
}

export function createPopup(options: PopupOptions): Popup {
  return new Popup(options);
}
