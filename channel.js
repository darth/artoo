
module.exports = async (chat, client, channel, type, ...text) => {
  let value = text.join(" ");
  const info = {};
  if (type === "gameId") {
    const game = await client.helix.games.getGameByName(value);
    if (!game) {
      return;
    }
    value = game.id;
  }
  info[type] = value;
  client.helix.channels.updateChannelInfo(channel.id, info);
};
