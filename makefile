# This makefile requires that `bin/poll` has been run at least once.

dest = docs
build = build
bin = node_modules/.bin

pages = $(shell find pages -type f -not -path '*/\.*' | tr " " "\n" | cut -c 6- | xargs)
pages_files = $(addprefix $(dest), $(shell echo $(pages) | tr " " "\n" | grep -v ".html\|.xml" | xargs))
pages_html = $(addprefix $(dest), $(shell echo $(pages) | tr " " "\n" | grep ".html" | xargs))
pages_xml = $(addprefix $(dest), $(shell echo $(pages) | tr " " "\n" | grep ".xml" | xargs))
# posts = $(shell tail -n +2 $(build)/distill-posts/posts.csv | cut -d "," -f2 | xargs)
# posts_dest_folders = $(addprefix $(dest)/, $(addsuffix /, $(posts)))
# posts_dest_index = $(addsuffix index.html, $(posts_dest_folders))
# posts_dest_archive = $(addsuffix index.archive.html, $(posts_dest_folders))

posts =
posts_files =
posts_html =

final_files = \
	$(dest)/template.v1.js \
	$(dest)/template.v1.js.map \
	$(pages_files) \
	$(pages_html) \
	$(pages_xml)
	# $(posts_dest_folders) \
	# $(posts_dest_index) \
	# $(posts_dest_archive) \

.PHONY: all clean

all: $(final_files)

clean:
	@echo "posts_files"
	@echo $(posts_files)
	@echo "posts_html"
	@echo $(posts_html)

logpages:
	@echo "pages_files"
	@echo $(pages_files)
	@echo "pages_html"
	@echo $(pages_html)
	@echo "pages_xml"
	@echo $(pages_xml)

logposts:
	@echo $(posts)

$(build)/journaldata.json: journal.json
	mkdir -p $(build)
	cat $< | bin/journaldata > $@

$(build)/postsdata.json: $(build)/journaldata.json $(build)/distill-posts/posts.csv
	mkdir -p $(build)
	bin/postsdata $^ > $@

# $(posts_dest_index) : $(dest)/%/index.html: $(build)/posts/%/public/index.html
# 	echo "!!!!post index"
# 	echo "post index" > $@

# $(posts_dest_archive) : $(dest)/%/index.archive.html : $(build)/posts/%/public/index.html
# 	echo "!!!!archive"
# 	echo "archive" >  $@

# $(dest)/%/ : $(build)/posts/%/
# 	mkdir -p $@
# 	cp -rf $</public/ $@/
# 	rm $@/index.html

#TODO make this data file dependent on all the posts' .html
$(build)/pagesdata.json: $(build)/postsdata.json
	bin/pagesdata $< $@ > $@

# pages/*/** but not .html or .xml files
$(pages_files): $(dest)/% : pages/%
	mkdir -p $(dir $@)
	cp $< $@

# pages/*/index.html
$(pages_html): $(dest)/% : $(build)/pagesdata.json pages/%
	mkdir -p $(dir $@)
	bin/renderpage $^ > $@

# pages/rss.xml
$(pages_xml): $(dest)/% : $(build)/pagesdata.json pages/%
	mkdir -p $(dir $@)
	$(bin)/mustache $^

$(dest)/template.v1.js: $(build)/distill-template/dist/template.js
	mkdir -p $(dir $@)
	cp $< $@

$(dest)/template.v1.js.map: $(build)/distill-template/dist/template.js.map
	mkdir -p $(dir $@)
	cp $< $@