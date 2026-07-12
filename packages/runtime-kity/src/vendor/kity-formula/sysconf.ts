export function createSysconf(fontList: any[]) {
  return {
    zoom: 0.66,
    font: {
      meanline: Math.round((380 / 1000) * 50),
      baseline: Math.round((800 / 1000) * 50),
      baseHeight: 50,
      list: fontList
    },
    resource: {
      path: "src/resource/"
    },
    func: {
      "ud-script": {
        limit: true
      }
    }
  };
}
