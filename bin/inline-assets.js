#!/usr/bin/env node

let fs = require("fs"),
    path = require('path');

module.exports = function(dom, selector, attribute, root) {
  Array.prototype.forEach.call(dom.querySelectorAll(selector), function(el) {
    const mimetypeFromExtension = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".jpeg": "image/jpeg",
      ".jpg": "image/jpeg",
      ".gif": "image/gif",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".bmp": "image/bmp",
      ".webp": "image/webp",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".midi": "audio/midi",
      ".ogg": "audio/ogg"
    }
    let assetPath = el.getAttribute(attribute);
    // Check if it's already a data uri.
    if (assetPath.slice(0,5) !== "data:") {
      let binary = fs.readFileSync(path.join(root, assetPath));
      let base64 = new Buffer(binary).toString("base64");
      let extension = path.extname(assetPath);
      el.setAttribute(attribute, "data:" + mimetypeFromExtension[extension] + ";base64," + base64);
    }
  });
}
