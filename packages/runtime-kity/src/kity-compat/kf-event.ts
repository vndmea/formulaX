export const kityEvent = {
  createEvent(type: string) {
    return new Event(type, {
      bubbles: true,
      cancelable: true,
    });
  },
};
