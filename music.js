const runScript = require("run-applescript");

module.exports = async (chat, client, channel, name) => {
  const artist = await runScript(
    'tell application "Music" to artist of current track as string'
  );
  const track = await runScript(
    'tell application "Music" to name of current track as string'
  );
  await chat.say(channel.displayName, `Now playing: ${artist} – ${track}`);
};
