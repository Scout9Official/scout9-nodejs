import { XMLParser, XMLValidator } from 'fast-xml-parser';

export function isSvg(str) {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof str}\``);
  }

  str = str.trim();

  if (str.length === 0) {
    return false;
  }

  // Has to be `!==` as it can also return an object with error info.
  if (XMLValidator.validate(str) !== true) {
    return false;
  }

  let jsonObject;
  const parser = new XMLParser();

  try {
    jsonObject = parser.parse(str);
  } catch {
    return false;
  }

  if (!jsonObject) {
    return false;
  }

  if (!('svg' in jsonObject)) {
    return false;
  }

  return true;
}
