
module.exports = async (context, type, ...text) => {
  let value = text.join(" ");
  const info = {};
  if (type === "gameId") {
    const game = await context.client.helix.games.getGameByName(value);
    if (!game) {
      return;
    }
    value = game.id;
  }
  info[type] = value;
  context.client.helix.channels.updateChannelInfo(channel.id, info);
};
