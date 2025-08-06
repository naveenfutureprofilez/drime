export class TopProgressBar {
  animationDuration = 300; /*ms*/

  hiding = false;
  value = 0;
  visible = false;
  constructor() {
    this.el = this.createProgressElement();
  }
  show() {
    if (!this.visible) {
      this.visible = true;
      this.installProgressElement();
    }
  }
  hide() {
    if (this.visible && !this.hiding) {
      this.setValue(1);
      this.hiding = true;
      this.fadeProgressElement(() => {
        this.uninstallProgressElement();
        this.stopTrickling();
        this.visible = false;
        this.hiding = false;
      });
    }
  }
  setValue(value) {
    this.value = value;
    this.refresh();
  }
  installProgressElement() {
    this.el.style.width = '0';
    this.el.style.opacity = '1';
    document.documentElement.insertBefore(this.el, document.body);
    requestAnimationFrame(() => {
      this.refresh();
      this.startTrickling();
    });
  }
  fadeProgressElement(callback) {
    this.el.style.opacity = '0';
    setTimeout(callback, this.animationDuration * 1.5);
  }
  uninstallProgressElement() {
    if (this.el.parentNode) {
      document.documentElement.removeChild(this.el);
    }
  }
  startTrickling() {
    if (!this.trickleInterval) {
      this.trickleInterval = window.setInterval(this.trickle, this.animationDuration);
    }
  }
  stopTrickling() {
    window.clearInterval(this.trickleInterval);
    delete this.trickleInterval;
  }
  trickle = () => {
    this.setValue(this.value + Math.random() / 100);
  };
  refresh() {
    requestAnimationFrame(() => {
      this.el.style.width = `${10 + this.value * 90}%`;
    });
  }
  createProgressElement() {
    const element = document.createElement('div');
    element.className = 'be-top-progress-bar';
    return element;
  }
}