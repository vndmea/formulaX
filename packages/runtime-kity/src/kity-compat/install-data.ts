import { kityCharPosition } from './char-position';
import { kityOtherPosition } from './other-position';

declare global {
  interface Window {
    __FORMULAX_KITY_DATA__?: {
      charPosition: typeof kityCharPosition;
      otherPosition: typeof kityOtherPosition;
    };
  }
}

export function installKityCompatData(target: Window = window) {
  target.__FORMULAX_KITY_DATA__ = {
    charPosition: kityCharPosition,
    otherPosition: kityOtherPosition,
  };
}
