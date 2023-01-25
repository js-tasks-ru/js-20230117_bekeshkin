/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (string === undefined || size === undefined) {
    return string;
  }
  let index = 0; //индекс для перебора строки
  let count = 1; //счетчик повторов
  let result = ''; //результирующая строка
  while (size > 0 && index < string.length) {
    // если результирующая строка содержит символы, и последний символ совпадает с текущим символом исходной строки
    if (result.length > 0 && result[result.length - 1] === string[index]) {
      // проверим счетчик повторов
      if (count === size) {
        // если он достиг максимум количества повторов, то перейдем к следующему символу в исходной строке,
        // тем самым пропустим добавление в результрирующу строку
        index++;
        continue;
      } else {
        // увеличим счетчик, если не достигли максимум количества повторов
        count++;
      }
    } else {
      // сбросим счетчик в случае если символы различаются
      count = 1;
    }
    // если дошли до сюда, добавим текущий символ к результирующей строке
    result += string[index++];
  }
  return result;
}
