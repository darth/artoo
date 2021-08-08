const runScript = require("run-applescript");

module.exports = async (context) => {
  const artist = await runScript(
    'tell application "Music" to artist of current track as string'
  );
  const track = await runScript(
    'tell application "Music" to name of current track as string'
  );
  await context.chat.say(
    context.channel.displayName,
    `Now playing: ${artist} – ${track}`
  );
};
