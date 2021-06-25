const www = require("./www.js");

module.exports = async (chat, client, channel, name) => {
  await www.enqueue("voice", name);
};
