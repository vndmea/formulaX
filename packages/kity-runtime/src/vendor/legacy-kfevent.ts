export const legacyKfEvent = {
  createEvent(type: string) {
    return new Event(type, {
      bubbles: true,
      cancelable: true,
    });
  },
};
