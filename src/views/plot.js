const dataJson = require("../../data.json");
let i = 1;
const dataFilter = dataJson.filter((data, _, array) => {
  if (i === 1) return true;
  if (i < array.length) {
    i++;
    return parseInt(data.rpm) - parseInt(array[i - 1].rpm) < 30;
  }
});
console.log(dataJson);
console.log(dataFilter);
