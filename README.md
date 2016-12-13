# Build and Deploy the Distill Website

Instructions for how to build and deploy the [http://distill.pub](http://distill.pub).

Each page on the website is a `post`, whose contents are stored in an external github repository. The only other html page that is not contained within a post repository is the `index` page, which is generated separately.

The manifest of posts is documented in `package.json` under a `posts` object which maps a path to a github repo with a public path on the distill website. The `bin/clone.js` script clones (or pulls) each repository listed into the publish path directory. The `bin/build.js` script then copies everything from the `public/` directory of those repositories to the indicated publish path inside our `docs` folder. We also run a few transformations on the html files and generates a few additional files. The `docs` folder is then served automatically by [github pages](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/) when the changes are committed and pushed to Github.

## Transformations to the HTML of each post

We do a few transformations to all the `.html` files that are direct children of the `public/` folder of each post.

- *Distill components* TK

- *Analytics* Adds analytics to the bottom of the page (currently google analytics).

- *Meta* Adds a number of tags if they are not present: including `<!doctype html>`, `<title></title>`, `<meta charset="utf8">`, and tags recommended by Google Scholar, Facebook, and Twitter.
<!--
Tags:
https://www.monperrus.net/martin/accurate+bibliographic+metadata+and+google+scholar
http://blog.reallywow.com/archives/123/
http://www.crossref.org/CrossTech/2008/05/natures_metadata_for_web_pages_1.html
http://ian.tresman.co.uk/preparing-article-meta-data-google-scholar.htm
http://dublincore.org/documents/dcmi-terms/#elements-publisher
-->

<!--
Build a bibliography at the bottom of the post with just items referenced in the document.
(Could potentially use microdata format: https://www.w3.org/wiki/WebSchemas/CitationPromotion)
-->

<!-- - *Byline* Take the authors from package.json and render out the byline markup -->
<!-- - *Smartypants* Does nice typographic substitutions (smart quotes, etc.) -->
<!-- - *Footnotes* Inline footnotes and a collection at the bottom of the post -->
<!-- - *Inline Citations* Inline citations are references to an external bibtex file -->
<!-- - *Biliography Citations* Build a bibliography at the bottom of the post with just items referenced in the document. -->

## Additional generated files

We also generate a few files that are not provided by the posts.

- *distill.pub/index.html*

- *distill.pub/rss.xml*

- *distill.pub/post/crossref.xml* Each post gets a [crossref](http://www.crossref.org/) xml file inserted into its root directory.

<!-- - *bibtex* -->
<!-- - *json* -->
