// Generate CrossRef XML
// See https://github.com/openjournals/joss-papers for examples

var fs = require("fs"),
	jsdom = require("jsdom").jsdom,
  bibtexParse = require('bibtex-parse-js'),
	xml = require('xml');

var markup = fs.readFileSync("data/index.html", "utf8");
var doc = jsdom(markup);

var data_raw = fs.readFileSync("data/distill_package.json", "utf8");
var data = JSON.parse(data_raw).distill;

var raw_bib = fs.readFileSync("data/test.bib", "utf8");
var bib = {};
bibtexParse.toJSON(raw_bib).forEach(e => {
  bib[e.citationKey] = e.entryTags;
  bib[e.citationKey].type = e.entryType;
});

function get_citations(doc){
	var citations = [];
	var cite_tags = doc.defaultView.document.getElementsByTagName("d-cite");
	cite_tags = Object.keys(cite_tags).map(i => cite_tags[i]);
	data.citations = data.citations || [];
	cite_tags.forEach(cite_tag => {
		var keys = cite_tag.innerHTML.split(",");
		keys.forEach(key => citations.push(key) );
	})
	citations = citations.filter((k,i) => citations.indexOf(k) == i); //unique
	return citations;
}

function citation_xml(key, ind){
	if (!(key in bib)) return {};
	var ent = bib[key];
	var info = [];
	info.push({_attr: {key: "ref"+ind}});
	if ("title" in ent)
		info.push({article_title: ent.title});
	if ("author" in ent)
		info.push({author: ent.author.split(" and ")[0].split(",")[0].trim()});
	if ("journal" in ent)
		info.push({journal_title: ent.journal});
	if ("booktitle" in ent)
		info.push({volume_title: ent.booktitle});
	if ("volume" in ent)
		info.push({volume: ent.volume});
	if ("issue" in ent)
		info.push({issue: ent.issue});
	if ("doi" in ent)
		info.push({doi: ent.doi});
	return {citation: info}
}


//console.log(data)

process(doc, data);

//console.log(doc.documentElement.innerHTML);

function process(doc, data) {
	var date = new Date(data.firstPublished);
	//FOR TESTING ONLY
	var journal_doi = "10.98765/distill";
	var article_doi = journal_doi + "." + "1";
	var journal_vol = date.getFullYear()-2015;
	var journal_issue = date.getMonth();
	var batch_timestamp = Math.floor(Date.now() / 1000);
	var batch_id = data.authors[0].lastName.split(" ")[0].toLowerCase().slice(0,20);
	    batch_id += "_" + date.getFullYear();
	    batch_id += "_" + data.title.split(" ")[0].toLowerCase().slice(0,20) + "_" +  batch_timestamp;
	// generate XML
	var crf_data =
		{doi_batch : [

			{ _attr: {
				version: "4.3.7",
				xmlns: "http://www.crossref.org/schema/4.3.7",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation": "http://www.crossref.org/schema/4.3.7 http://www.crossref.org/schemas/crossref4.3.7.xsd",
			}},

			{ head: [
				{doi_batch_id: batch_id},
				{timestamp: batch_timestamp},
				{depositor: [
					{depositor_name: "Distill Admin"},
					{email_address: "admin@distill.pub"},
				]},
				{registrant: "Distill"},
			]},

			{body: [
				{journal: [

					{journal_metadata: [
						{full_title: "Distill"},
						{abbrev_title: "Distill"},
						{doi_data: [
							{doi: journal_doi},
							{resource: "http://distill.pub/"},
						]},
					]},

					{journal_issue: [
						{publication_date: [
							{month: date.getMonth()},
							{year: date.getFullYear()},
						]},
						{journal_volume: [
							{volume: journal_vol},
						]},
						{issue: journal_issue},
					]},

					{journal_article: [
						{titles: [
							{title: data.title},
						]},
						{ contributors:
							data.authors.map((author, ind) => (
								{person_name: [
									{ _attr: {
										contributor_role: "author",
										sequence: (ind == 0)? "first" : "additional"
									}},
									{given_name: author.firstName},
									{surname: author.lastName},
									{affiliation: author.affiliation}
									// TODO: ORCID?
								]}
							))
						},
						{publication_date: [
								{month: date.getMonth()},
								{day: date.getDate()},
								{year: date.getFullYear()}
						]},
						{ publisher_item: [
							{item_number: article_doi}
						]},
						{doi_data: [
							{doi: article_doi},
							//{timestamp: ""},
							{resource: data.url},
						]},
						{citation_list:
							get_citations(doc).map(citation_xml)
						}

					]},

				]},
			]},
		]};
	console.log(xml(crf_data, {indent: "  "}));

}
