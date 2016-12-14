module.exports = (post, local) => {

  // "publishPath": "2016/augmented-rnns",
  // "githubRepo": "distillpub/post--augmented-rnns"
  var d = {};

  // Descriptions
  d.title = local.title;
  d.description = local.description;

  // distill.pub url
  d.url = "http://distill.pub/" + post.publishPath;

  // github.com url of repository
  d.githubUrl = "https://github.com/" + post.githubRepo;

  d.homepage = !post["no-homepage"];

  // Dates

  // view.distill.firstPublished = new Date(view.distill.firstPublished);
  // view.distill.firstPublishedYear = view.distill.firstPublished.getFullYear();
  // view.distill.firstPublishedMonth = months[view.distill.firstPublished.getMonth()];
  // view.distill.firstPublishedDate = view.distill.firstPublished.getDate();
  // view.distill.lastPublished = new Date(view.distill.lastPublished);
  // d.volume = local.firstPublishedYear - 2015;
  // d.number = local.firstPublished.getMonth() + 1;
  // view.distill.citationDate = zeroPadding(view.distill.firstPublished.getDate());
  // view.distill.citationMonth = zeroPadding(view.distill.firstPublished.getMonth() + 1);

  // Identifier
  // d.slug = local.authors[0].lastName.toLowerCase() + local.firstPublishedYear + local.title.split(" ")[0].toLowerCase()

  // List of authors
  d.authors = JSON.parse(JSON.stringify(local.authors));

  // if (view.distill.authors.length  > 2) {
  //   view.distill.concatenatedAuthors = view.distill.authors[0].lastName + ", et al.";
  // } else if (view.distill.authors.length === 2) {
  //   view.distill.concatenatedAuthors = view.distill.authors[0].lastName + " & " + view.distill.authors[1].lastName;
  // } else if (view.distill.authors.length === 1) {
  //   view.distill.concatenatedAuthors = view.distill.authors[0].lastName
  // }

  // view.distill.bibtexAuthors = view.distill.authors.map(function(author){
  //   return author.lastName + ", " + author.firstName;
  // }).join(" and ");
  //


  return d;
}
