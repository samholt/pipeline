let marked = require("marked");

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true
});

module.exports = (dom, data) => {
  let markdownElements = [].slice.call(dom.querySelectorAll("[markdown]"));
  markdownElements.forEach((el) => {
    let contents = el.innerHTML;
    el.innerHTML = marked(contents);
  });
}
