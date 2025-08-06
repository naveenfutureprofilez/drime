export function createRafLoop(callback) {
  let id;
  function start() {
    // Time updates are already in progress.
    if (!isUndefined(id)) return;
    loop();
  }
  function loop() {
    id = window.requestAnimationFrame(function rafLoop() {
      if (isUndefined(id)) return;
      callback();
      loop();
    });
  }
  function stop() {
    if (isNumber(id)) window.cancelAnimationFrame(id);
    id = undefined;
  }
  return {
    start,
    stop
  };
}
function isUndefined(value) {
  return typeof value === 'undefined';
}
function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}