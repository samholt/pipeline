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
      ".woff": "application/font-woff",
      ".woff2": "application/font-woff2",
      ".otf": "application/font-sfnt",
      ".ttf": "application/font-sfnt",
      ".midi": "audio/midi",
      ".ogg": "audio/ogg"
    }
    let assetPath = el.getAttribute(attribute);
    // Check if it's already a data uri.
    if (assetPath.slice(0,5) !== "data:") {
      if (fs.existsSync(path.join(root, assetPath))) {
        let binary = fs.readFileSync(path.join(root, assetPath));
        let extension = path.extname(assetPath);
        let base64 = new Buffer(binary).toString("base64");
        // For css files, we need to replace any url() assets.
        if (extension === ".css") {
          let css = fs.readFileSync(path.join(root, assetPath), "utf8");
          let re = /url(?:\(['"]?)(.*?)(?:['"]?\))/g;
          let replacements = [];
          let match;
          while ((match = re.exec(css)) !== null) {
            let cssAssetPath = path.join(root, match[1]);
            if (fs.existsSync(cssAssetPath)) {
              let binary = fs.readFileSync(cssAssetPath);
              let extension = path.extname(cssAssetPath);
              let base64 = new Buffer(binary).toString("base64");
              let dataUri = "data:" + mimetypeFromExtension[extension] + ";base64," + base64;
              replacements.push({
                url: match[1],
                data: dataUri
              });
            }
          }
          replacements.forEach(function(r) {
            css = css.replace(r.url, r.data);
          });
          // console.log(css);
          base64 = new Buffer(css).toString("base64");
        }

        el.setAttribute(attribute, "data:" + mimetypeFromExtension[extension] + ";base64," + base64);
      } else {
        console.warn("Can't find asset for archiving: " + assetPath);
      }
    }
  });
}
