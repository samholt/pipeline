var through = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    jsdom = require("jsdom").jsdom,
    serializeDocument = require("jsdom").serializeDocument,
    distill = require("distill-template");

module.exports = function() {
  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return cb();
    }
    if (file.isBuffer()) {
      var htmlString = String(file.contents);
      var dom = jsdom(htmlString, {features: {ProcessExternalResources: false, FetchExternalResources: false}});
      distill.render(dom, {});
      let transformedHtml = serializeDocument(dom);
      file.contents = Buffer(transformedHtml);
    }
    // make sure the file goes through the next gulp plugin
    this.push(file);
    // tell the stream engine that we are done with this file
    cb();
  });
  // returning the file stream
  return stream;
};