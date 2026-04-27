import { legacyCharPosition } from './char-position';
import { legacyOtherPosition } from './other-position';

declare global {
  interface Window {
    __FORMULAX_KITY_DATA__?: {
      charPosition: typeof legacyCharPosition;
      otherPosition: typeof legacyOtherPosition;
    };
  }
}

export function installLegacyKityData(target: Window = window) {
  target.__FORMULAX_KITY_DATA__ = {
    charPosition: legacyCharPosition,
    otherPosition: legacyOtherPosition,
  };
}
