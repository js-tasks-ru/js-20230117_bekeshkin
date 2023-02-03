export default class NotificationMessage {
  constructor(text = '', param = {duration: 10, type: 'success'}) {
    this.text = text;
    this.duration = param.duration;
    this.type = param.type;
    this.render();
  }

  static inner;

  get element() {
    return NotificationMessage.inner;
  }

  get template() {
    return `<div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
          <div class="timer"></div>
          <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
              ${this.text}
            </div>
          </div>
        </div>`;
  }

  show(parent = document.body) {
    this.remove();
    this.render();
    parent.appendChild(this.element);
    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  destroy() {
    this.remove();
  }

  remove() {
    if (NotificationMessage.inner) {
      NotificationMessage.inner.remove();
    }
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    NotificationMessage.inner = wrapper.firstElementChild;
  }
}
