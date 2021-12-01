const socket = io();
socket.on("system", function (msg) {
  const sound = document.createElement("audio");
  sound.id = "sound";
  sound.src = "sounds/" + msg;
  sound.type = "audio/mpeg";
  sound.autoplay = true;
  document.body.appendChild(sound);
  sound.addEventListener("ended", (event) => {
    document.body.removeChild(sound);
  });
});
