import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  subElements = {};
  rangePeriod;

  constructor() {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);

    this.rangePeriod = {
      from: monthAgo,
      to: today
    };

    this.sorted = {
      id: header.find(item => item.sortable).id,
      order: 'asc'
    };

    this.rangePicker = new RangePicker(this.rangePeriod);
    this.sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      sorted: this.sorted,
      isSortLocally: true,
      step: 30,
      start: 0
    });

    this.ordersChart = new ColumnChart({
      label: 'orders',
      link: '#',
      formatHeading: data => data,
      url: 'api/dashboard/orders',
      range: this.rangePeriod,
    });

    this.salesChart = new ColumnChart({
      label: 'sales',
      link: '',
      formatHeading: data => data,
      url: 'api/dashboard/sales',
      range: this.rangePeriod,
    });

    this.customersChart = new ColumnChart({
      label: 'customers',
      link: '',
      formatHeading: data => data,
      url: 'api/dashboard/customers',
      range: this.rangePeriod,
    });
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
      this.subElements.rangePicker.remove();
      this.subElements.ordersChart.remove();
      this.subElements.salesChart.remove();
      this.subElements.customersChart.remove();
      this.subElements.sortableTable.remove();
      this.element.remove();
    }
  }

  destroy() {
    this.remove();

    this.element = null;
    this.subElements = null;
    this.rangePeriod = null;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.subElements.rangePicker.append(this.rangePicker.element);
    this.subElements.ordersChart.append(this.ordersChart.element);
    this.subElements.salesChart.append(this.salesChart.element);
    this.subElements.customersChart.append(this.customersChart.element);
    this.subElements.sortableTable.append(this.sortableTable.element);
    this.element.addEventListener('date-select', this.dateSelectEvent);
    return this.element;
  }

  async updatePage(event) {
    const ordersChartPromise = this.ordersChart.loadData(event.detail.from, event.detail.to);
    const salesChartPromise = this.salesChart.loadData(event.detail.from, event.detail.to);
    const customersChartPromise = this.customersChart.loadData(event.detail.from, event.detail.to);
    const sortableTablePromise = this.sortableTable.loadData(event.detail.from, event.detail.to, this.sorted.id, this.sorted.order);
    const [ordersData, salesData, customersData, sortableTableData] = await Promise.all([ordersChartPromise, salesChartPromise, customersChartPromise, sortableTablePromise]);
    console.log(sortableTableData);
    this.sortableTable.renderRows(sortableTableData);
  }

  dateSelectEvent = (event) => {
    this.updatePage(event);
  };

}
