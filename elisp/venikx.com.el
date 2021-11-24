;;; venikx.com.el --- Description -*- lexical-binding: t; -*-
;;
;; Copyright (C) 2021 Kevin Rangel
;;
;; Author: Kevin Rangel <https://github.com/venikx>
;; Maintainer: Kevin Rangel <code@venikx.com>
;; Created: October 16, 2021
;; Modified: October 16, 2021
;; Version: 0.0.1
;; Keywords: abbrev bib c calendar comm convenience data docs emulations extensions faces files frames games hardware help hypermedia i18n internal languages lisp local maint mail matching mouse multimedia news outlines processes terminals tex tools unix vc wp
;; Homepage: https://github.com/venikx/venikx.com
;; Package-Requires: ((emacs "27.2"))
;;
;; This file is not part of GNU Emacs.
;;
;;; Commentary:
;;
;;  Description
;;
;;; Code:

(defvar venikx.com-root "~/code/venikx.com")
;; (setq org-confirm-babel-evaluate nil)
(org-babel-load-file (expand-file-name "elisp/config.org" venikx.com-root))

(provide 'venikx.com)
;;; venikx.com.el ends here
