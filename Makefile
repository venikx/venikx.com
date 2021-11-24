publish_dir := public
org-cache_dir := elisp/.org-cache
packages_dir := elisp/.packages

EMACS.funcall = emacs -Q --batch -l elisp/venikx.com.el --funcall

all: clean publish

publish:
	$(EMACS.funcall) venikx.com-publish

clean:
	rm -rf $(publish_dir)
	rm -rf $(packages_dir)
	rm -rf $(org-cache_dir)

start:
	simple-http-server public
