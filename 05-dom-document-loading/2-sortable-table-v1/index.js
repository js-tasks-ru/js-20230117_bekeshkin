export default class SortableTable {

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  sortedHeader = null;
  sortedOrder = null;
  element = {};
  subElements = {};

  getHeadres() {
    return this.headerConfig
      .map(header => {
        return `<div class="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}" ${this.getOrder(header.id)}>
                    <span>${header.title}</span>
                </div>`;
      }).join("");
  }

  getOrder(id) {
    return this.sortedOrder && this.sortedHeader && this.sortedHeader.id === id ? `data-order="${this.sortedOrder}"` : "";
  }

  getRows() {
    return this.data
      .map(row => {
        return `
        <a href="#" class="sortable-table__row">
            ${this.headerConfig
              .map(header => {
                if (header.template) {
                  return header.template(row);
                } else {
                  return `<div class="sortable-table__cell">${row[header.id]}</div>`;
                }}).join("")}
        </a>
        `;
      }).join("");
  }

  get template() {
    return `
    <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getHeadres()}
        </div>
        <div data-element="body" class="sortable-table__body">
            ${this.getRows()}
        </div>
    </div>`;
  }


  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.element.lastElementChild;
  }

  sort(field, order = 'asc') {
    // проверим наличие колонки для фильтрации
    this.sortedHeader = this.headerConfig.find(el => el.id === field);
    this.sortedOrder = order;

    // формируем коэффициент сортирофки
    const coef = this.sortedOrder === 'asc' ? 1 : -1;
    // сортировка
    this.data = this.data.sort((a, b) => {
      if (this.sortedHeader.sortType === 'string') {
        return coef * (a[this.sortedHeader.id].localeCompare(b[this.sortedHeader.id], 'ru'));
      } else if (this.sortedHeader.sortType === 'number') {
        return coef * (a[this.sortedHeader.id] - b[this.sortedHeader.id]);
      }
    });

    this.render();
  }

  destroy() {
    this.remove();
    this.headerConfig = undefined;
    this.data = undefined;
    this.element = {};
    this.subElements = {};
    this.sortedHeader = null;
    this.sortedOrder = null;
  }

  remove() {
    this.element && this.element.remove();
  }
}

