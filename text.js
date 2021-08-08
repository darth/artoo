module.exports = async (context, ...args) => {
  for (const arg of args) {
    await context.chat.say(context.channel.displayName, arg);
  }
};
