import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};
  data = [];
  response;

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date()
    },
    label = '',
    link = '',
    formatHeading = data => data
  } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
    this.response = this.update(this.range.from, this.range.to);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    this.data = null;
    this.response = null;
  }

  get template() {
    return `<div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
          ${this.formatHeading(this.value)}
        </div>
        <div data-element="body" class="column-chart__chart">
          ${this.getColumnBody(this.data)}
        </div>
      </div>
    </div>`;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  getColumnBody(values) {
    if (values) {
      const maxValue = Math.max(...values);
      const scale = this.chartHeight / maxValue;
      return values
        .map(item => {
          const percent = ((item / maxValue) * 100).toFixed(0);
          return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
        })
        .join("");
    }
    return "";
  }

  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    if (this.data && this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

    this.subElements = this.getSubElements();
  }

  async update(from, to) {
    this.range.from = from;
    this.range.to = to;

    const url = new URL(BACKEND_URL + '/' + this.url);
    if (from && to) {
      url.searchParams.set('from', this.range.from.toISOString());
      url.searchParams.set('to', this.range.to.toISOString());
    }
    this.data = [];

    this.element.classList.add('column-chart_loading');

    return await fetchJson(url)
      .then(
        response => {
          this.value = 0;
          Object.entries(response).forEach(item => {
            this.data.push(item[1]);
            this.value += item[1];
          });
          this.subElements.body.innerHTML = this.getColumnBody(this.data);
          this.subElements.header.innerHTML = this.formatHeading(this.value);
          this.element.classList.remove('column-chart_loading');
          return response;
        }
      ).catch((error) => {
        console.log(error);
      });
  }
}
