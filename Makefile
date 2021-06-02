publish_dir := public
timestamps_dir := .timestamps
orgs := $(wildcard *.org)
emacs_pkgs := org

publish_el := elisp/publish.el

^el = $(filter %.el,$^)
EMACS.funcall = emacs --batch --no-init-file $(addprefix --load ,$(^el)) --funcall

all: clean publish

publish: $(publish_el) $(orgs)
	$(EMACS.funcall) venikx-publish-all

clean:
	rm -rf $(publish_dir)
	rm -rf $(timestamps_dir)
