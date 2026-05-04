export const legacyCommonUtils = {
  contains: (parent: Node, target: Node) => {
    if (parent.contains) {
      return parent.contains(target);
    }
    if (parent.compareDocumentPosition) {
      return !!(parent.compareDocumentPosition(target) & 16);
    }
    return false;
  },
  getRect: (node: Element) => node.getBoundingClientRect(),
};
