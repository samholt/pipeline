let d3 = require("d3-time-format");

let RFC = d3.timeFormat("%a, %d %b %Y %H:%M:%S %Z");

module.exports = (post, journal) => {

  var d = {};

  // Descriptions
  d.title = post.title;
  d.description = post.description;

  // paths
  d.distillPath = post.distillPath;
  d.githubPath = post.githubPath;
  d.url = "http://distill.pub/" + post.distillPath;
  d.githubUrl = "https://github.com/" + post.githubPath;

  // Homepage
  d.homepage = !post.noHomepage;

  // Dates
  // TODO: fix updated date
  d.updatedDate = post.publishedDate;
  let months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  let zeroPad = (n) => { return n < 10 ? "0" + n : n; };
  d.publishedDate = post.publishedDate;
  d.publishedDateRFC = RFC(d.publishedDate);
  d.publishedYear = d.publishedDate.getFullYear();
  d.publishedMonth = months[d.publishedDate.getMonth()];
  d.publishedDay = d.publishedDate.getDate();
  d.publishedMonthPadded = zeroPad(d.publishedDate.getMonth() + 1);
  d.publishedDayPadded = zeroPad(d.publishedDate.getDate());
  d.volume = d.publishedDate.getFullYear() - 2015;
  d.issue = d.publishedDate.getMonth() + 1;

  // Authors
  d.authors = JSON.parse(JSON.stringify(post.authors));
  d.authors.forEach((a) => {
    if (!a.firstName || !a.lastName || !a.personalURL || !a.affiliation || !a.affiliationURL) {
      console.error("Author missing required field(s) in " + post.githubPath);
    }
  });
  d.bibtexAuthors = d.authors.map(function(author){
    return author.lastName + ", " + author.firstName;
  }).join(" and ");

  if (d.authors.length  > 2) {
    d.concatenatedAuthors = d.authors[0].lastName + ", et al.";
  } else if (d.authors.length === 2) {
    d.concatenatedAuthors = d.authors[0].lastName + " & " + d.authors[1].lastName;
  } else if (d.authors.length === 1) {
    d.concatenatedAuthors = view.distill.authors[0].lastName;
  }

  // Identifier
  // d.slug = post.authors[0].lastName.toLowerCase() + post.firstPublishedYear + post.title.split(" ")[0].toLowerCase()

  // var name = post.distillPath.split("/")[1];
  // if (post.doi_suffix != undefined){
  //   // Is the DOI a duplicate?
  //   if (dois.indexOf(post.doi_suffix) != -1)
  //     throw Error("Duplicate DOI suffix: " + post.doi_suffix);
  //   dois.push(post.doi_suffix);
  //   // Save DOI if for this post
  //   if (name == data.name)
  //     data.doi = data.journal.doi + "." + ("0000" + post.doi_suffix).slice(-5);
  // }

  return d;
}
