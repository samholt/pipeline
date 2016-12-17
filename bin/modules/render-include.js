let fs = require("fs"),
    path = require("path");

module.exports = (dom, data, p) => {
  let includes = [].slice.call(dom.querySelectorAll("dt-include"));
  includes.forEach((el) => {
    let s = el.getAttribute("src");
    el.removeAttribute("src");
    let file = fs.readFileSync(path.join(p, s), "utf8");
    el.innerHTML = file;
    // let n = dom.createElement("div");
    // n.innerHTML = file;
    // el.parentElement.insertBefore(n, el);
    // el.parentElement.removeChild(el);
  });
}
