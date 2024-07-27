export default class {
  constructor(delay) {
    this.delay = delay;
  }

  trigger(callback) {
    if (!this.callback)
      setTimeout(this.onTimeout.bind(this), this.delay);
    this.callback = callback;
  }

  onTimeout() {
    this.callback();
    this.callback = null;
  }
}
