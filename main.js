const fs = require("fs");
const yaml = require("js-yaml");
const Keyv = require("keyv");
const { ApiClient } = require("twitch");
const {
  StaticAuthProvider,
  ClientCredentialsAuthProvider,
} = require("twitch-auth");
const { ChatClient } = require("twitch-chat-client");
const { WebHookListener, SimpleAdapter } = require("twitch-webhooks");
const { EventSubListener, ReverseProxyAdapter } = require("twitch-eventsub");
const TelegramBot = require("node-telegram-bot-api");
const Strava = require("strava-v3");
const dayjs = require("dayjs");
require("dayjs/locale/it");

const www = require("./www.js");

const handlers = {
  channel: require("./channel.js"),
  voice: require("./voice.js"),
  music: require("./music.js"),
  text: require("./text.js"),
  update: require("./update.js"),
  strava: require("./strava.js"),
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
    process.exit(1);
  }
  return parsed;
};

const writeYaml = (path, data) => {
  try {
    fs.writeFileSync(path, yaml.dump(data));
  } catch (err) {
    console.error(`Cannot write YAML file ${path}!`);
    process.exit(1);
  }
};

const config = readYaml("config.yaml", "configuration file");
const commands = new Keyv("sqlite://commands.db");

dayjs.locale("it");

const refreshStrava = async () => {
  const payload = await Strava.oauth.refreshToken(
    config.strava.auth.tokens.refresh
  );
  config.strava.auth.tokens.auth = payload.access_token;
  config.strava.auth.tokens.refresh = payload.refresh_token;
  setTimeout(() => {
    refreshStrava();
  }, payload.expires_in - 3600 * 1000);
};

const run = async () => {
  const tg = new TelegramBot(config.telegram.auth, { polling: true });
  Strava.config({
    access_token: config.strava.auth.tokens.access,
    client_id: config.strava.auth.client_id,
    client_secret: config.strava.auth.client_secret,
  });
  await refreshStrava();
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
    const cmd = await commands.get(cmdText);
    if (cmd) {
      const stream = await clientSimple.helix.streams.getStreamByUserName(
        channelName.substring(1)
      );
      if (cmd.online && !stream) {
        chat.say(channelName, "Stream is offline.");
      } else {
        if (
          cmd.privileged &&
          !msg.userInfo.isBroadcaster &&
          msg.userInfo.isMod
        ) {
          chat.say(channelName, "Sorry, you are not authorized.");
        } else {
          await handlers[cmd.handler](
            {
              chat,
              channel,
              client: clientSimple,
              strava: new Strava.client(config.strava.auth.tokens.access),
              commands,
            },
            ...cmd.args,
            ...cmdArgs
          );
        }
      }
    } else {
      await chat.say(channelName, "Sorry, I don't know such command!");
    }
  });
  const listener = new EventSubListener(
    clientCred,
    new ReverseProxyAdapter({
      hostName: config.hooks.server.host,
      pathPrefix: config.hooks.server.prefix,
      port: config.hooks.server.port,
      externalPort: config.hooks.server.external_port,
    })
  );
  await listener.listen();
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

process.on("SIGTERM", () => {
  writeYaml("config.yaml", config);
  process.exit(0);
});

run();
