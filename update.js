module.exports = async (context, cmdName, ...text) => {
  if (text.length > 0) {
    const cmd = await context.commands.get(cmdName);
    if (cmd && cmd.handler === "text") {
      cmd.args = text.join(" ").split("|");
      context.commands.set(cmdName, cmd);
    }
  }
};
