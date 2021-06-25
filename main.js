const fs = require("fs");
const yaml = require("js-yaml");
const { ApiClient } = require("twitch");
const {
  StaticAuthProvider,
  ClientCredentialsAuthProvider,
} = require("twitch-auth");
const { ChatClient } = require("twitch-chat-client");
const { WebHookListener, SimpleAdapter } = require("twitch-webhooks");
const { EventSubListener, ReverseProxyAdapter } = require("twitch-eventsub");
const TelegramBot = require("node-telegram-bot-api");

const www = require("./www.js");

const handlers = {
  channel: require("./channel.js"),
  voice: require("./voice.js"),
  music: require("./music.js"),
  text: require("./text.js"),
};

const readYaml = (path, desc) => {
  let data;
  try {
    data = fs.readFileSync(path, "utf-8");
  } catch (err) {
    console.error(`Cannot read ${desc}!`);
    process.exit();
  }
  let parsed;
  try {
    parsed = yaml.load(data);
  } catch (err) {
    console.error(`Malformed ${desc}!`);
    process.exit();
  }
  return parsed;
};

const config = readYaml("config.yaml", "configuration file");
const commands = readYaml("commands.yaml", "file with commands");

const run = async () => {
  const tg = new TelegramBot(config.telegram.auth, { polling: true });
  const simpleUserAuth = new StaticAuthProvider(
    config.twitch.auth.client_id,
    config.twitch.auth.tokens.user
  );
  const simpleBotAuth = new StaticAuthProvider(
    config.twitch.auth.client_id,
    config.twitch.auth.tokens.bot
  );
  const credAuth = new ClientCredentialsAuthProvider(
    config.twitch.auth.client_id,
    config.twitch.auth.client_secret
  );
  const clientCred = new ApiClient({ authProvider: credAuth });
  const clientSimple = new ApiClient({ authProvider: simpleUserAuth });
  const channel = await clientSimple.helix.channels.getChannelInfo(
    config.twitch.channel.id
  );
  const chat = new ChatClient(simpleBotAuth, {
    channels: [config.twitch.channel.name],
  });
  await chat.connect();
  chat.onMessage(async (channelName, user, message, msg) => {
    if (!message.startsWith(config.prefix)) {
      return;
    }
    const arr = message.slice(1).split(" ");
    const cmdText = arr[0];
    const cmdArgs = arr.slice(1);
    if (cmdText in commands) {
      const cmd = commands[cmdText];
      const stream = await clientSimple.helix.streams.getStreamByUserName(
        channelName.substring(1)
      );
      if (!cmd.online || stream) {
        if (
          !cmd.privileged ||
          msg.userInfo.isBroadcaster ||
          msg.userInfo.isMod
        ) {
          await handlers[cmd.handler](
            chat,
            clientSimple,
            channel,
            ...cmd.args,
            ...cmdArgs
          );
        }
      }
    } else if (cmdText === "help") {
      await chat.say(
        channelName,
        `Available commands: ${Object.keys(commands)
          .map((c) => config.prefix + c)
          .join(", ")}`
      );
    } else {
      await chat.say(channelName, "Sorry, I don't know such command!");
    }
  });
  const listener = new EventSubListener(
    clientCred,
    new ReverseProxyAdapter({
      hostName: config.hooks.server.host,
      pathPrefix: config.hooks.server.prefix,
    })
  );
  await listener.listen(config.hooks.server.port);
  if (config.telegram.enable) {
    const onlineSubscription = await listener.subscribeToStreamOnlineEvents(
      config.twitch.channel.id,
      async (e) => {
        const stream = await clientCred.helix.streams.getStreamByUserId(
          config.twitch.channel.id
        );
        const game = await stream.getGame();
        await tg.sendMessage(
          config.telegram.channel,
          `Annie just went live!
Description: ${stream.title}
Category: ${game.name}
Language: ${stream.language}
https://twitch.tv/${config.twitch.channel.name}`
        );
      }
    );
  }
  await www.listen(config.www);
  const followSubscription = await listener.subscribeToChannelFollowEvents(
    config.twitch.channel.id,
    async (e) => {
      await www.enqueue("alert", {
        t: "follow",
        args: { user: e.userDisplayName },
      });
    }
  );
  setTimeout(async () => {
    await www.enqueue("alert", {
      t: "follow",
      args: { user: "darth" },
    });
    await www.enqueue("alert", {
      t: "follow",
      args: { user: "annie" },
    });
    await www.enqueue("alert", {
      t: "follow",
      args: { user: "vader" },
    });
  }, 5000);
};

run();
