import JSONBrowser from '../src/json-browser';

const jsonString = '{"people": [{"name": "kim", "age": "20"},{"name": "noh", "age": "30"}] } ';
const browser = JSONBrowser.parse(jsonString);

console.log(browser.json);