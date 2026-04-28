export function createLegacyBaseComponent(kity: { createClass: (name: string, definition: object) => unknown }) {
  return kity.createClass('Component', {
    constructor() {},
  });
}
