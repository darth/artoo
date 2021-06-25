module.exports = async (chat, client, channel, ...args) => {
  for (const arg of args) {
    await chat.say(channel.displayName, arg);
  }
};
