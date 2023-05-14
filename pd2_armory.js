module.exports = async (context, ...args) => {
  if (args.length === 0) {
    await context.chat.say(context.channel.displayName, "Must provide name of the character!");
  }
  else {
    for (const arg of args) {
      await context.chat.say(context.channel.displayName, `https://projectdiablo2.com/character/${arg}`);
    }
  }
};
