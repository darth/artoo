const pluralize = require("pluralize");

module.exports = async (context, text, num) => {
  const numStr = pluralize("time", num, true);
  await context.chat.say(context.channel.displayName, `${text} ${numStr}!`);
};
