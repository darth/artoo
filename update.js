const counter = require("./counter.js");

module.exports = async (context, cmdName, ...args) => {
  const cmd = await context.commands.get(cmdName);
  if (cmd) {
    if (cmd.handler === "text") {
      if (args.length > 0) {
        cmd.args = args.join(" ").split("|");
        context.commands.set(cmdName, cmd);
      }
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
      await counter(context, ...cmd.args);
    }
  }
};
