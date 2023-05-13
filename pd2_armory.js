module.exports = async (context, ...args) => {
  await context.chat.say(context.channel.displayName, `https://projectdiablo2.com/character/${args[0]}`);
  for (const arg of args) {
    await context.chat.say(context.channel.displayName, arg);
  }
};
