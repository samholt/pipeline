module.exports = (post) => {

  var d = {};

  // Descriptions
  d.title = post.title;
  d.description = post.description;

  // paths
  d.publishPath = post.publishPath;
  d.url = "http://distill.pub/" + post.publishPath;
  d.githubUrl = "https://github.com/" + post.githubRepo;

  d.homepage = !post.noHomepage;

  // Dates
  let months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  let zeroPad = (n) => { return n < 10 ? "0" + n : n; };

  d.publishedDate = post.publishedDate;
  d.publishedYear = d.publishedDate.getFullYear();
  d.publishedMonth = months[d.publishedDate.getMonth()];
  d.publishedDay = d.publishedDate.getDate();

  d.publishedMonthPadded = zeroPad(d.publishedDate.getMonth() + 1);
  d.publishedDayPadded = zeroPad(d.publishedDate.getDate());

  d.volume = d.publishedDate.getFullYear() - 2015;
  d.number = d.publishedDate.getMonth() + 1;

  // Identifier
  // d.slug = post.authors[0].lastName.toLowerCase() + post.firstPublishedYear + post.title.split(" ")[0].toLowerCase()

  // List of authors
  d.authors = JSON.parse(JSON.stringify(post.authors));

  d.authors.forEach((a) => {
    if (!a.firstName || !a.lastName || !a.personalURL || !a.affiliation || !a.affiliationURL) {
      console.error("Author missing required field(s) in " + post.githubRepo);
    }
  })

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


  // module.exports = function preprocess_data(data){
  //   set_volume_issue(data);
  //   handle_dois(data);
  // }
  //
  // function set_volume_issue(data){
  //   var date = new Date(data.firstPublished);
  //   data.volume = date.getFullYear()-2015;
  //   data.issue = date.getMonth();
  // }
  //
  // function handle_dois(data) {
  //   var dois = [];
  //   data.journal.posts.forEach(post => {
  //     var name = post.publishPath.split("/")[1];
  //     if (post.doi_suffix != undefined){
  //       // Is the DOI a duplicate?
  //       if (dois.indexOf(post.doi_suffix) != -1)
  //         throw Error("Duplicate DOI suffix: " + post.doi_suffix);
  //       dois.push(post.doi_suffix);
  //       // Save DOI if for this post
  //       if (name == data.name)
  //         data.doi = data.journal.doi + "." + ("0000" + post.doi_suffix).slice(-5);
  //     }
  //   });
  // }


  return d;
}
