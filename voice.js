const www = require("./www.js");

module.exports = async (context, name) => {
  await www.enqueue("voice", name);
};
