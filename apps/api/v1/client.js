(function (global) {
  'use strict';
  const moduleUrl = new URL('client.mjs', document.currentScript?.src || global.location.href).href;
  global.Atmoscene = Object.freeze({
    load: () => import(moduleUrl),
    create: async (options) => {
      const { AtmosceneClient } = await import(moduleUrl);
      return new AtmosceneClient(options);
    }
  });
})(window);
