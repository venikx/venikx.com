# Makefile for Blogging using GNU Emacs & Org mode & Hugo

.PHONY: clean publish develop

all: publish

publish:
	@echo "Publishing venikx.com in public/ ..."
	hugo

develop:
	@echo "Starting the Hugo development server..."
	hugo server -D

clean:
	@echo "Cleaning up.."
	@rm -rvf *.elc
	@rm -rvf public
	@rm -rvf ~/.org-timestamps/*

# Deprecated way of using org-publish to export to HTML
#
# EMACS =
#
# ifndef EMACS
# EMACS = "emacs"
# endif
#
# publish: publish.el
# 	@echo "Publishing... with current Emacs configurations."
# 	${EMACS} --batch --load publish.el --funcall org-publish-all
#
# publish_no_init: publish.el
# 	@echo "Publishing... with --no-init."
# 	${EMACS} --batch --no-init --load publish.el --funcall org-publish-all
