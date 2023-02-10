export default class SortableTable {
  constructor(headersConfig, {
    data = [], sorted = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.sorted = sorted;
    this.data = this.sortDate(data, this.sorted.id, this.sorted.order);
    this.render();
    this.initializeClick();
  }

  element = {};
  subElements = {};

  getSortable(id) {
    return this.isSortedNow(id) ? `data-order="${this.sorted.order}"` : ``;
  }

  getHeadres() {
    return this.headerConfig
      .map(header => {
        return `<div class="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}" ${this.getSortable(header.id)}>
                    <span>${header.title}</span>
                    <span data-element="arrow" class="sortable-table__sort-arrow">
                        <span class="sort-arrow"></span>
                    </span>
                </div>`;
      }).join('');
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
            }
          }).join("")}
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

  isSortedNow = (id) => {
    return this.sorted.order && this.sorted.id && this.sorted.id === id;
  };

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  destroy() {
    this.remove();
    this.headerConfig = null;
    this.data = null;
    this.sorted = null;
    this.element = null;
    this.subElements = null;
  }

  pointerdown = event => {

    const map = {
      desc: 'asc', asc: 'desc'
    };

    const headerCell = event.target.closest('div');
    const field = headerCell.dataset.id;
    const order = map[headerCell.dataset.order || 'asc'];
    this.sort(field, order);
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  initializeClick() {
    this.subElements.header.addEventListener("pointerdown", this.pointerdown);
  }

  sort(field, order) {
    this.data = this.sortDate(this.data, field, order);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector('.sortable-table__cell[data-id="' + field + '"]');

    allColumns.forEach(column => {
      column.dataset.order = '';
    });
    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getRows();
  }

  sortDate(data, field, order) {
    const arr = [...data];
    const column = this.headerConfig.find(h => h.id === field);

    if (column) {
      // формируем коэффициент сортирофки
      const descending = order === 'asc' ? 1 : -1;
      // сортировка
      return arr.sort((a, b) => {
        if (column.sortType === 'string') {
          return descending * (a[column.id].localeCompare(b[column.id], 'ru'));
        } else if (column.sortType === 'number') {
          return descending * (a[column.id] - b[column.id]);
        }
      });
    } else {
      return arr;
    }
  }
}
