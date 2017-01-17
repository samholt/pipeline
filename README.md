# Build and Deploy the Distill Website

Instructions for how to build and deploy the [http://distill.pub](http://distill.pub) website.

Each article on the website is a `post`, whose contents are stored in an external github repository. The manifest of articles is defined in another [public external repo](https://github.com/distillpub/posts/blob/master/posts.csv).

For pages which are not articles, we have a concept of `pages`. These are located within this repository under the `pages/` directory. Each of these go through the same HTML template transformations as articles, with an additional pass through a mustache template evaluator with a data object containing meta data for each of the `posts`. This is how we create the `index.html`.

There are two main commands to know. 

- `yarn clone` will copy the latest manifest file, then clone and pull the latest from each of the repositories.

- `yarn build` will run all the transformations necessary to build the site, then place all the output in the `docs/` folder. The `docs/` folder is then served automatically by [github pages](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/) when the changes are committed and pushed to Github.

## Additional generated files

We also generate a few files that are not provided by the posts or pages.

- `distill.pub/rss.xml`

- `distill.pub/post/crossref.xml` Each post gets a [crossref](http://www.crossref.org/) xml file inserted into its rendered, public directory.
