/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const props = path.split('.');
  return function (obj) {
    return getValue(obj, props, 0);
  };
}

/**
 * Рекурсия для получения свойств с учетом вложенности
 * @param obj - объект
 * @param props - массив свойств, которые необходимо перебрать
 *              '[name1, name2, name3, ..., nameN]',где 'nameN' - конечное свойство,
 * @returns {*|undefined}
 */
function getValue(obj, props, index) {
  if (obj !== undefined && props[index] !== undefined) {
    return getValue(obj[props[index]], props, ++index);
  }
  return obj;
}
