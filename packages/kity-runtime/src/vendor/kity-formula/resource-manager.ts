export function createResourceManager(kity: any, resourceConfig: any, FontInstaller: any, Formula: any) {
  const callbackList: Array<(formula: any) => void> = [];
  let readyState = false;
  let initialized = false;

  return {
    ready(cb: (formula: any) => void, options?: any) {
      if (!initialized) {
        initialized = true;
        init(options);
      }
      if (readyState) {
        window.setTimeout(() => {
          cb(Formula);
        }, 0);
        return;
      }
      callbackList.push(cb);
    }
  };

  function init(options?: any) {
    const resolvedOptions = kity.Utils.extend({}, resourceConfig, options);
    new FontInstaller(document, resolvedOptions).mount(complete);
  }

  function complete() {
    readyState = true;
    kity.Utils.each(callbackList, (cb: (formula: any) => void) => {
      cb(Formula);
    });
    callbackList.length = 0;
  }
}
