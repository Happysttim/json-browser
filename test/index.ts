import JSONBrowser from '../src/json-browser';

const jsonString = '{"arrayTest": [{"Name": "NOH", "Age": 25, "HasNum": [1,2,3,4,5]},{"Name": "Kim", "Age": 23}]}';
const browser = JSONBrowser.parse(jsonString);

// console.log(JSON.parse(jsonString));
console.log(browser.json["arrayTest"][0]["HasNum"]);