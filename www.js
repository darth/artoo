const http = require("http");

const static = require("node-static");
const _ = require("lodash");
const file = new static.Server(`${__dirname}/www`);

const server = http.createServer((req, res) => {
  file.serve(req, res);
});

const io = require("socket.io")(server);

let config;

exports.enqueue = async (type, content) => {
  try {
    if (type === "alert") {
      io.emit("alert", {
        img: config.alert.definitions[content.t].img,
        text: _.template(config.alert.definitions[content.t].text)(
          content.args
        ),
        sound: config.alert.definitions[content.t].sound,
        duration: config.alert.duration,
        pause: config.alert.pause,
      });
    } else if (type === "voice") {
      io.emit("voice", content);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.listen = (c) => {
  config = c;
  server.listen(config.port);
};
