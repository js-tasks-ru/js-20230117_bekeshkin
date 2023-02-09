class Tooltip {
  static instance;

  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  pointerOver = (event) => {
    const overDiv = event.target.closest('[data-tooltip]');
    if (overDiv) {
      this.render(overDiv.dataset.tooltip);
      document.addEventListener('pointermove', this.pointerMove);
    }
  };

  pointerMove = (event) => {
    const shift = 10;
    this.element.style.left = `${event.clientX + shift}px`;
    this.element.style.top = `${event.clientY + shift}px`;
  };


  pointerOut = (event) => {
    this.remove();
    document.removeEventListener('pointermove', this.pointerMove);
  };

  initialize() {
    document.addEventListener('pointerover', this.pointerOver);
    document.addEventListener('pointerout', this.pointerOut);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.pointerOver);
    document.removeEventListener('pointerout', this.pointerOut);
    this.remove();
  }

  render(text) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML += text;

    document.body.append(this.element);
  }
}

export default Tooltip;
