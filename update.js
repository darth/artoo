module.exports = async (context, type, ...text) => {
  if (text.length > 1) {
    const cmdName = text[0];
    const cmd = await context.commands.get(cmdName);
    if (cmd && cmd.handler === "text") {
      cmd.args = text.slice(1).join(" ").split("\n");
      context.commands.set(cmdName, cmd);
    }
  }
};
