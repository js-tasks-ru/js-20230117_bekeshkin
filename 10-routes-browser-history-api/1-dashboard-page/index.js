import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  element
  subElements = {};
  components = {};
  rangePeriod;

  constructor() {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(today.getMonth() - 1);

    this.rangePeriod = {
      from: monthAgo,
      to: today
    };

    this.sorted = {
      id: header.find(item => item.sortable).id,
      order: 'asc'
    };

    this.initComponents();
  }


  get template() {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
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

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;

    Object.values(this.components).forEach(component => component.destroy());

    this.components = null;
    this.rangePeriod = null;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.renderComponents();
    this.element.addEventListener('date-select', this.dateSelectEvent);
    return this.element;
  }

  async updatePage(from, to) {
    const ordersChartPromise = this.components.ordersChart.loadData(from, to);
    const salesChartPromise = this.components.salesChart.loadData(from, to);
    const customersChartPromise = this.components.customersChart.loadData(from, to);
    const sortableTablePromise = this.components.sortableTable.loadData(from, to, this.sorted.id, this.sorted.order);
    const resultOfPromises = await Promise.all([ordersChartPromise, salesChartPromise, customersChartPromise, sortableTablePromise]);
    this.components.sortableTable.renderRows(resultOfPromises.at(-1));
  }

  dateSelectEvent = (event) => {
    this.updatePage(event.detail.from, event.detail.to);
  };

  initComponents() {
    const rangePicker = new RangePicker(this.rangePeriod);

    const sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      sorted: this.sorted,
      isSortLocally: true,
      step: 30,
      start: 0
    });

    const ordersChart = new ColumnChart({
      label: 'orders',
      link: '#',
      formatHeading: data => data,
      url: 'api/dashboard/orders',
      range: this.rangePeriod,
    });

    const salesChart = new ColumnChart({
      label: 'sales',
      link: '',
      formatHeading: data => data,
      url: 'api/dashboard/sales',
      range: this.rangePeriod,
    });

    const customersChart = new ColumnChart({
      label: 'customers',
      link: '',
      formatHeading: data => data,
      url: 'api/dashboard/customers',
      range: this.rangePeriod,
    });
    this.components = {
      rangePicker,
      sortableTable,
      ordersChart,
      salesChart,
      customersChart
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const {element} = this.components[component];
      root.append(element);
    });
  }

}
