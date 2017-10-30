"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encode = encode;
exports.decode = decode;
// to ensure markdown compatability we need to specifically encode some characters
function encode(href) {
  return href.trim().replace(/ /g, "%20").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
}

function decode(href) {
  return decodeURI(href);
}