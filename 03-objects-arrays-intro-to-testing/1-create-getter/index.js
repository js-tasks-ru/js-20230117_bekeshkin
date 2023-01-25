/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    if (path === 'undefined') {
      return obj;
    }
    const props = path.split('.');
    return getValue(obj, props);
  };
}

/**
 * Рекурсия для получения свойств с учетом вложенности
 * @param obj - объект
 * @param props - массив свойств, которые необходимо перебрать
 *              '[name1, name2, name3, ..., nameN]',где 'nameN' - конечное свойство,
 * @returns {*|undefined}
 */
function getValue(obj, props) {
  // если объект неопределен, возвращаем его
  if (obj === undefined) {
    return obj;
  }
  // если конечное свойство
  if (props.length === 1) {
    // то возвращаем значение конечное свойства
    return obj[props[0]];
  } else {
    // иначе ищем дальше в объекте, который располагается в конечном свойстве
    const [prop, ...other] = props;
    return getValue(obj[prop], other);
  }
}
