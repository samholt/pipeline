// <script src="http://distill.pub/components.js"></script>
module.exports = (dom, data) => {
  let s = dom.querySelector('script[src="http://distill.pub/components.js"]');
  if (s) { s.parentElement.removeChild(s); }
  let newS = dom.createElement("script");
  newS.src = "/components.js";
  dom.querySelector("head").appendChild(newS);
}
