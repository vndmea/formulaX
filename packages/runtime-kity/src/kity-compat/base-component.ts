export function createKityBaseComponent(kity: { createClass: (name: string, definition: object) => unknown }) {
  return kity.createClass('Component', {
    constructor() {},
  });
}
