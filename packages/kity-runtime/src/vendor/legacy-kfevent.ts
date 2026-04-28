export const legacyKfEvent = {
  createEvent(type: string) {
    const event = document.createEvent('Event');
    event.initEvent(type, true, true);
    return event;
  },
};
