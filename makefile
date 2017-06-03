dest = docs
build = build
bin = node_modules/.bin

final_files = \
	$(dest)/template.v1.js \
	$(dest)/template.v1.js.map \
	$(dest)/rss.xml

$(build)/posts.csv:
	mkdir -p $(build)
	curl https://raw.githubusercontent.com/distillpub/posts/master/posts.csv > $@

$(build)/posts.json: $(build)/posts.csv
	cat $^ | bin/clone > $@

$(build)/journal.json: journal.json
	cat $^ | bin/journal > $@

$(build)/data.json: $(build)/journal.json $(build)/posts.json
	bin/data $^ > $@

.PHONY: clean all

all: $(final_files)

clean:
	rm -rf $(dest)/

# Copy the distill template files so it is publically available
$(dest)/template.v1.js: distill-template/dist/template.js
	mkdir -p $(dir $@)
	cat $^ > $@

$(dest)/template.v1.js.map: distill-template/dist/template.js
	mkdir -p $(dir $@)
	cat $^ > $@

# journal.json > data.journal
# posts/posts.json
data:

$(dest)/rss.xml:
	$(bin)/mustache pages/rss.xml > $@