import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';
const PRODUCTS_API = '/api/rest/products';
const CATEGORIES_API = '/api/rest/categories';

export default class ProductForm {

  categories = [];
  product = {};

  defaultProduct = {
    title: '',
    description: '',
    images: [],
    subcategory: '',
    price: 100,
    discount: 0,
    status: 1,
  };

  constructor(productId) {
    this.productId = productId;
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
    this.categories = null;
    this.product = null;
  }

  getOptions(categories) {
    return categories.map(cat => {
      return cat.subcategories.map(sub => {
        return `<option value="${sub.id}">${cat.title} &gt; ${sub.title}</option>`;
      }).join('');
    }).join('');
  }

  getImage(image) {
    return `
    <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${image.url}">
        <input type="hidden" name="source" value="${image.source}">
        <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
            <span>${image.source}</span>
        </span>
        <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
    </li>`;
  }

  getImages(images) {
    if (images) {
      return `<ul class="sortable-list">${images.map(i => {
        return this.getImage(i);
      }).join("")}</ul>`;
    }
    return ``;
  }

  get template() {
    return `
    <div class="product-form">
        <form data-element="productForm" class="form-grid">
            <div class="form-group form-group__half_left">
                <fieldset>
                    <label class="form-label">Название товара</label>
                    <input id="title" required="" type="text" name="title" class="form-control"
                           placeholder="Название товара" value="${escapeHtml(this.product.title)}">
                </fieldset>
            </div>
            <div class="form-group form-group__wide">
                <label class="form-label">Описание</label>
                <textarea id="description" required="" class="form-control" name="description" data-element="productDescription"
                          placeholder="Описание товара">${escapeHtml(this.product.description)}</textarea>
            </div>
            <div class="form-group form-group__wide" data-element="sortable-list-container">
                <label class="form-label">Фото</label>
                <div data-element="imageListContainer">${this.getImages(this.product.images)}</div>
                <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
            </div>
            <div class="form-group form-group__half_left">
                <label class="form-label">Категория</label>
                <select class="form-control" name="subcategory" id="subcategory">${this.getOptions(this.categories)}</select>
            </div>
            <div class="form-group form-group__half_left form-group__two-col">
                <fieldset>
                    <label class="form-label">Цена ($)</label>
                    <input id="price" required="" type="number" name="price" class="form-control" placeholder="100" value="${this.product.price}">
                </fieldset>
                <fieldset>
                    <label class="form-label">Скидка ($)</label>
                    <input  id="discount" required="" type="number" name="discount" class="form-control" placeholder="0" value="${this.product.discount}">
                </fieldset>
            </div>
            <div class="form-group form-group__part-half">
                <label class="form-label">Количество</label>
                <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1" value="${this.product.quantity}">
            </div>
            <div class="form-group form-group__part-half">
                <label class="form-label">Статус</label>
                <select class="form-control" name="status" id="status">
                    <option value="1">Активен</option>
                    <option value="0">Неактивен</option>
                </select>
            </div>
            <div class="form-buttons">
                <button type="submit" name="save" class="button-primary-outline">Сохранить товар</button>
            </div>
        </form>
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

  async render() {
    await this.update();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    this.setSelectValue("status", this.product.status);
    this.setSelectValue("subcategory", this.product.subcategory);
    return this.element;
  }

  async update() {
    const categoriesPromise = this.loadCategories();
    const productDataPromise = this.productId
      ? this.loadProductData(this.productId)
      : [this.defaultProduct];
    const [categoriesDate, productDataResponse] = await Promise.all([categoriesPromise, productDataPromise]);
    const [productData] = productDataResponse;
    this.categories = categoriesDate;
    this.product = productData;
  }

  loadCategories() {
    const url = new URL(BACKEND_URL + CATEGORIES_API);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return fetchJson(url);
  }

  loadProductData(id) {
    const url = new URL(BACKEND_URL + PRODUCTS_API);
    url.searchParams.set('id', id);
    return fetchJson(url);
  }

  setSelectValue(id, value) {
    let element = this.element.querySelector('#' + id);
    element.value = value;
  }

  onSubmit = event => {
    event.stopPropagation();
    this.save();
  };

  async save() {
    const formData = this.getFormData();
    if (this.productId) {
      formData.append('id', this.productId);
      const result = await this.updateData(formData);
      this.element.dispatchEvent(new CustomEvent("product-updated", {
        bubbles: true,
        cancelable: true,
        detail: result.id
      }));
      this.productId = result.id;
    } else {
      const result = await this.saveData(formData);
      this.element.dispatchEvent(new CustomEvent("product-saved", {
        bubbles: true,
        cancelable: true,
        detail: result.id
      }));
      this.productId = result.id;
    }
  }

  getFormData() {
    let formData = new FormData();
    const form = this.subElements.productForm;
    const excludeFields = ['images'];
    const numberFields = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultProduct).filter(item => !excludeFields.includes(item));
    const getValue = field => form.querySelector(`[name=${field}].value`);

    for (const field of fields) {
      const value = getValue(field);
      if (numberFields.includes(field)) {
        formData.append(field, parseInt(value));
      } else {
        formData.append(field, value);
      }
    }

    return formData;
  }

  saveData(formData) {
    const url = new URL(BACKEND_URL + PRODUCTS_API);
    return fetchJson(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
  }

  updateData(formData) {
    const url = new URL(BACKEND_URL + PRODUCTS_API);
    return fetchJson(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
  }

}
