;; publish.el --- Publish my website to the public/ folder
;; Author: venikx

;;; Commentary:
;; This script is run by the gitlab-ci, which converts org-mode files
;; into HTML files.

;;; Code:
;; Initialization
(require 'package)
(package-initialize)
(add-to-list 'package-archives '("org" . "https://orgmode.org/elpa/") t)
(add-to-list 'package-archives '("melpa" . "https://melpa.org/packages/") t)
(package-refresh-contents)
(package-install 'htmlize)
(package-install 'org-plus-contrib)
(package-install 'ox-reveal)

(require 'org)
(require 'ox-publish)
;; (require 'htmlize)
;; (require 'ox-html)
;; (require 'ox-rss)
(require 'ox-reveal)

(defvar venikx/title "Kevin Rangel \u26A1 Web Developer"
  "The title of the site (sets the title for the Browser Tab).")

(defvar venikx/description "Kevin Rangel is a web developer, focusing mainly on Javascript but likes to fiddle around with C/C++ and Rust."
  "The description of site (partly for SEO).")

(defvar venikix/site-attachments
  (regexp-opt '("jpg" "jpeg" "gif" "png" "svg"
                "ico" "cur" "css" "js"
                "eot" "woff" "woff2" "ttf" "pdf"))
  "File types that are published as static files.")

;; Formatting
(defvar venikx/date-format "%F")

;; Exporting configuration
(setq org-export-with-smart-quotes t
      org-export-preserve-breaks nil
      org-export-with-broken-links "mark"
      org-export-with-section-numbers nil
      org-export-with-toc nil
      backup-directory-alist `(("." . ,(concat user-emacs-directory "backups"))))

(setq org-html-divs '((preamble "header")
                      (content "main")
                      (postamble "footer"))
      org-html-container-element "section"
      org-html-metadata-timestamp-format venikx/date-format
      org-html-checkbox-type 'html
      org-html-html5-fancy t
      org-html-validation-link t
      org-html-doctype "html5"
      org-html-htmlize-output-type 'css
      org-src-fontify-natively t)

;; Templates
(defvar venikx/html-head "
<link rel='icon' type='image/x-icon' href='/images/favicon.ico'/>
<meta name='viewport' content='width=device-width, initial-scale=1'>
<link rel='stylesheet' href='/css/site.css' type='text/css'/>
<link rel='stylesheet' href='/css/syntax-coloring.css' type='text/css'/>")

(defvar venikx/html-preamble "
<nav>
  <ul>
    <li><a href='/'>Home</a></li>
    <li><a href='/blog'>Blog</a></li>
    <li><a href='/about'>About</a></li>
  </ul>
</nav>")

(defvar venikx/html-postamble "
<p> Built with <3 using: Emacs</p>
<p> Copyright (C) 2020 Kevin 'Rangel' De Baerdemaeker, licenced under
  <a rel='license' href='http://creativecommons.org/licenses/by-nc/4.0/'>
    Creative Commons Attribution-Non Commercial 4.0 International License
  </a>.
 </p>
")

(defun venikx/org-sitemap (title list)
  "Generate sitemap as a string, setting TITLE.
The LIST is a representation of the files to include."
  (concat "#+TITLE: Sitemap\n"
          "#+DESCRIPTION: Kevin Rangel's personal blog\n\n"
          (org-list-to-subtree list)))

(setq org-publish-project-alist
      `(("blog"
         :base-directory "."
         :exclude ,(regexp-opt '("sitemap.org"))
         :base-extension "org"
         :recursive t
         :publishing-function org-html-publish-to-html
         :publishing-directory "./public"
         :auto-sitemap t
         :sitemap-filename "sitemap.org"
         :sitemap-title nil
         :sitemap-sort-files anti-chronologically
         :sitemap-function venikx/org-sitemap
         :html-head-include-scripts t
         :html-head-include-default-style nil
         :html-head ,venikx/html-head
         :html-preamble ,venikx/html-preamble
         :html-postamble ,venikx/html-postamble)
        ("css"
         :base-directory "./css"
         :base-extension "css"
         :publishing-directory "./public/css"
         :publishing-function org-publish-attachment
         :recursive t)
        ("images"
         :base-directory "./images"
           :base-extension "jpg\\|gif\\|png"
         :publishing-directory "./public/images"
         :publishing-function org-publish-attachment
         :recursive t)
        ;; ("rss"
        ;;  :base-directory "posts"
        ;;  :base-extension "org"
        ;;  :html-link-home "http://example.com/"
        ;;  :rss-link-home "http://example.com/"
        ;;  :html-link-use-abs-url t
        ;;  :rss-extension "xml"
        ;;  :publishing-directory "./public"
        ;;  :publishing-function (org-rss-publish-to-rss)
        ;;  :section-number nil
        ;;  :exclude ".*"
        ;;  :include ("index.org")
        ;;  :table-of-contents nil)
        ("all" :components ("blog" "css" "images"))))

(provide 'publish)
;;; publish.el ends here