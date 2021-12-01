(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var socket = io();
socket.on("voice", function (msg) {
  var sound = document.createElement("audio");
  sound.id = "sound";
  sound.src = "sounds/" + msg;
  sound.type = "audio/mpeg";
  sound.autoplay = true;
  document.body.appendChild(sound);
  sound.addEventListener("ended", function (event) {
    document.body.removeChild(sound);
  });
});

},{}]},{},[1]);
