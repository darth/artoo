module.exports = async (context, cmdName, ...args) => {
  if (text.length > 0) {
    const cmd = await context.commands.get(cmdName);
    if (cmd) {
      if (cmd.handler === "text") {
        cmd.args = text.join(" ").split("|");
        context.commands.set(cmdName, cmd);
      }
      else if (cmd.handler === "counter") {
        if (args.length === 0) {
          cmd.args[1] += 1;
          context.commands.set(cmdName, cmd);
        }
        else if (args.length === 1) {
          const num = parseInt(args[0]);
          if (!Number.isNaN(num)) {
            cmd.args[1] = num;
          }
        }
      }
    }
  }
};
