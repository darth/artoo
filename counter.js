
module.exports = async (context, text, num) => {
  await context.chat.say(context.channel.displayName, `${text}: ${num}`);
};
