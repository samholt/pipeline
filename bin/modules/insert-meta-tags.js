module.exports = (dom, data) => {
  dom.querySelector("html").setAttribute("lang", "en")
  let head = dom.querySelector("head");

  if (!dom.querySelector("meta[charset]")) {
    appendHtml(head, `<meta charset="utf-8">`);
  }
  if (!dom.querySelector("meta[name=viewport]")) {
    appendHtml(head, `<meta name="viewport" content="width=device-width, initial-scale=1">`);
  }

  appendHtml(head, `
    <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link href="/rss.xml" rel="alternate" type="application/rss+xml" title="Articles from Distill">
    <link rel="canonical" href="${data.url}">
    <title>${data.title}</title>
  `);

  appendHtml(head, `
    <!--  https://schema.org/Article -->
    <meta property="article:published" itemprop="datePublished" content="${data.publishedDate}" />
    <meta property="article:modified" itemprop="dateModified" content="${data.updatedDate}" />
  `);
  data.authors.forEach((a) => {
    appendHtml(head, `<meta property="article:author" content="${a.firstName} ${a.lastName}" />`)
  });

  appendHtml(head, `
    <!--  https://developers.facebook.com/docs/sharing/webmasters#markup -->
    <meta property="og:type" content="article"/>
    <meta property="og:title" content="${data.title}"/>
    <meta property="og:description" content="${data.description}">
    <meta property="og:url" content="${data.url}"/>
    <meta property="og:image" content="${data.url}/thumbnail.png"/>
    <meta property="og:locale" content="en_US" />
    <meta property="og:site_name" content="Distill" />
  `);

  appendHtml(head, `
    <!--  https://dev.twitter.com/cards/types/summary -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${data.title}">
    <meta name="twitter:description" content="${data.description}">
    <meta name="twitter:url" content="${data.url}">
    <meta name="twitter:image" content="${data.url}/thumbnail.png">
    <meta name="twitter:image:width" content="560">
    <meta name="twitter:image:height" content="295">
  `);

  appendHtml(head, `
    <!--  https://scholar.google.com/intl/en/scholar/inclusion.html#indexing -->
    <meta name="citation_title" content="${data.title}">
    <meta name="citation_publication_date" content="${data.publishedYear}/${data.publishedMonthPadded}/${data.publishedDayPadded}">
    <meta name="citation_journal_title" content="Distill">
    <meta name="citation_fulltext_html_url" content="${data.url}">
    <meta name="citation_volume" content="${data.volume}">
    <meta name="citation_issue" content="${data.issue}">
  `);
  // <meta name="citation_doi" content="data.doi">
  // <meta name="citation_issn" content="data.journal.issn">
  data.authors.forEach((a) => {
    appendHtml(head, `<meta name="citation_author" content="${a.lastName}, ${a.firstName}" />`)
  });

  return dom;
}

function appendHtml(el, html) {
  el.innerHTML += html;
}

function el(dom, tag, attributes, inner) {
  let element = dom.createElement(tag);
  Object.keys(attributes).forEach((key) => {
    element.setAttribute(key, attributes[key]);
  });
  if (inner) element.textContent = inner;
  return element;
}
