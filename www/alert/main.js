const WaitQueue = require("wait-queue");
const wq = new WaitQueue();
const handle = async (msg) => {
  const div = document.getElementById("alert");
  const img = document.getElementById("img");
  const text = document.getElementById("text");
  img.src = "pics/" + msg.img;
  text.textContent = msg.text;
  div.style.display = "flex";
  const sound = document.createElement("audio");
  sound.id = "sound";
  sound.src = "sounds/" + msg.sound;
  sound.type = "audio/mpeg";
  sound.autoplay = true;
  div.appendChild(sound);
  setTimeout(async () => {
    div.style.display = "none";
    div.removeChild(sound);
    setTimeout(() => {
      wq.shift().then(handle);
    }, msg.pause * 1000);
  }, msg.duration * 1000);
};

wq.shift().then(handle);
const socket = io();
socket.on("alert", function (msg) {
  wq.push(msg);
});
