let builder = require('xmlbuilder');

modules.exports = (posts) => {
  var root = builder.begin();
  var rss = root.element("rss")
  rss.attribute("version", "2.0");
  rss.attribute("xmlns:atom", "http://www.w3.org/2005/Atom");
  var channel = rss.element("channel");
  channel.element("title").text("Distill");
  channel.element("link").text("http://distill.pub");
  channel.element("atom:link").attribute("href", "http://distill.pub/rss.xml").attribute("rel", "self").attribute("type", "application/rss+xml");
  channel.element("description").text("Homepage articles from Distill");
  var now = new Date();
  channel.element("lastBuildDate").text(now.toUTCString());
  var channelImage = channel.element("image");
  channelImage.element("title").text("Distill");
  channelImage.element("url").text("http://distill.pub/favicon.png");
  channelImage.element("link").text("http://distill.pub");
  channel.element("language").text("en-us");
  channel.element("ttl").text("60");
  posts.forEach(function(post) {
    var item = channel.element("item");
    item.element("title").text(post.packageData.distill.title);
    item.element("link").text("http://distill.pub/" + post.publishPath);
    item.element("description").text(post.packageData.distill.description);
    item.element("guid").text("http://distill.pub/" + post.publishPath);
    var pubDate = new Date(post.packageData.distill.firstPublished);
    item.element("pubDate").text(pubDate.toUTCString());
  });
  return root.end({pretty: true});
}
