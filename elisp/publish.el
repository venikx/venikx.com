;;; publish --- Publish org files

;;; Commentary:

;; This file takes care of exporting org files to the public directory.
;; Images and such are also exported without any processing.

;;; Code:
(require 'package)
(package-initialize)
(unless package-archive-contents
  (add-to-list 'package-archives '("org" . "https://orgmode.org/elpa/") t)
  (add-to-list 'package-archives '("melpa" . "https://melpa.org/packages/") t)
  (package-refresh-contents))
(dolist (pkg '(org-plus-contrib htmlize))
  (unless (package-installed-p pkg)
    (package-install pkg)))

(require 'cl-lib)
(require 'org)
(require 'ox-publish)
(require 'ox-rss)

(defvar venikx/url "https://venikx.com/"
  "The URL where this site will be published.")

(defvar venikx/title "Kevin Rangel | venikx.com"
  "The title of this site (sets the Browser Tab).")

(defvar venikx/description "Kevin Rangel, venikx, is a freelance web developer based in Helsinki, Finland. "
  "The description of the site, mainly used for SEO.")

(defvar venikx/site-attachments
  (regexp-opt '("jpg" "jpeg" "gif" "png" "svg"
                "ico" "cur" "css" "js"
                "eot" "woff" "woff2" "ttf"
                "html" "pdf"))
  "File types that are published as static files.")

(defvar venikx/root
  (locate-dominating-file default-directory
                          (lambda (dir)
                            (seq-every-p
                             (lambda (file) (file-exists-p (expand-file-name file dir)))
                             '(".git" "content" "css" "elisp" "layouts" "posts"))))
  "Root directory of this project.")

(defvar venikx/layouts-directory
  (expand-file-name "layouts" venikx/root)
  "Directory where layouts are found.")

(defun venikx/pre-and-postamble-format (type)
  "Return the content for the pre/postamble of TYPE."
  `(("en" ,(with-temp-buffer
             (insert-file-contents (expand-file-name (format "%s.html" type) venikx/layouts-directory))
             (buffer-string)))))

(defun venikx/format-date-subtitle (file project)
  "Format the date found in FILE of PROJECT."
  (format-time-string "%e %B %Y" (org-publish-find-date file project)))

(defun venikx/org-html-tag (tag &rest attrs)
  "Return close-tag for string TAG.
ATTRS specify additional attributes."
  (concat "<" tag " "
          (mapconcat (lambda (attr)
                       (format "%s=\"%s\"" (car attr) (cadr attr)))
                     attrs
                     " ")
	  ">"))

(defun venikx/html-head-extra (file project)
  "Return <meta> elements for nice thumbnails."
  (let* ((info (cdr project))
         (org-export-options-alist
          `((:title "TITLE" nil nil parse)
            (:date "DATE" nil nil parse)
            (:author "AUTHOR" nil ,(plist-get info :author) space)
            (:description "DESCRIPTION" nil nil newline)
            (:keywords "KEYWORDS" nil nil space)
            (:meta-image "META_IMAGE" nil ,(plist-get info :meta-image) nil)
            (:meta-type "META_TYPE" nil ,(plist-get info :meta-type) nil)))
         (title (org-publish-find-title file project))
         (date (org-publish-find-date file project))
         (author (org-publish-find-property file :author project))
         (description (org-publish-find-property file :description project))
         (link-home (file-name-as-directory (plist-get info :html-link-home)))
         (extension (or (plist-get info :html-extension) org-html-extension))
	 (rel-file (org-publish-file-relative-name file info))
         (full-url (concat link-home (file-name-sans-extension rel-file) "." extension))
         (image (concat link-home (org-publish-find-property file :meta-image project)))
         (favicon (concat link-home "favicon.svg"))
         (type (org-publish-find-property file :meta-type project)))
    (mapconcat 'identity
               `(,(venikx/org-html-tag "link" '(rel icon) '(type image/svg+xml) '(sizes any) `(href ,favicon))
                 ,(venikx/org-html-tag "link" '(rel alternate) '(type application/rss+xml) '(href "rss.xml") '(title "RSS feed"))
                 ,(venikx/org-html-tag "meta" '(property og:title) `(content ,title))
                 ,(venikx/org-html-tag "meta" '(property og:url) `(content ,full-url))
                 ,(and description
                       (venikx/org-html-tag "meta" '(property og:description) `(content ,description)))
                 ,(venikx/org-html-tag "meta" '(property og:image) `(content ,image))
                 ,(venikx/org-html-tag "meta" '(property og:type) `(content ,type))
                 ,(and (equal type "article")
                       (venikx/org-html-tag "meta" '(property article:author) `(content ,author)))
                 ,(and (equal type "article")
                       (venikx/org-html-tag "meta" '(property article:published_time) `(content ,(format-time-string "%FT%T%z" date))))

                 ,(venikx/org-html-tag "meta" '(property twitter:title) `(content ,title))
                 ,(venikx/org-html-tag "meta" '(property twitter:url) `(content ,full-url))
                 ,(venikx/org-html-tag "meta" '(property twitter:image) `(content ,image))
                 ,(and description
                       (venikx/org-html-tag "meta" '(property twitter:description) `(content ,description)))
                 ,(and description
                       (venikx/org-html-tag "meta" '(property twitter:card) '(content summary)))
                 )
               "\n")))

(defun venikx/org-html-publish-to-html (plist filename pub-dir)
  "Wrapper function to publish an file to html.

PLIST contains the properties, FILENAME the source file and
  PUB-DIR the output directory."
  (let ((project (cons 'venikx plist)))
    (plist-put plist :subtitle
               (venikx/format-date-subtitle filename project))
    (plist-put plist :html-head-extra
               (venikx/html-head-extra filename project))
    (org-html-publish-to-html plist filename pub-dir)))

(defun venikx/org-html-format-headline-function (todo todo-type priority text tags info)
  "Format a headline with a link to itself.

This function takes six arguments:
TODO      the todo keyword (string or nil).
TODO-TYPE the type of todo (symbol: ‘todo’, ‘done’, nil)
PRIORITY  the priority of the headline (integer or nil)
TEXT      the main headline text (string).
TAGS      the tags (string or nil).
INFO      the export options (plist)."
  (let* ((headline (get-text-property 0 :parent text))
         (id (or (org-element-property :CUSTOM_ID headline)
                 (org-export-get-reference headline info)
                 (org-element-property :ID headline)))
         (link (if id
                   (format "<a href=\"#%s\">%s</a>" id text)
                 text)))
    (org-html-format-headline-default-function todo todo-type priority link tags info)))

(defun venikx/org-publish-sitemap (title list)
  "Generate sitemap as a string, having TITLE.
LIST is an internal representation for the files to include, as
returned by `org-list-to-lisp'."
  (let ((filtered-list (cl-remove-if (lambda (x)
                                       (and (sequencep x) (null (car x))))
                                     list)))
    (concat "#+TITLE: " title "\n"
            "#+OPTIONS: title:nil\n"
            "#+META_TYPE: website\n"
            "#+DESCRIPTION: A personal blog of Kevin Rangel, venikx, a freelance web developer based in Helsinki, Finland.\n"
            "\n#+ATTR_HTML: :class sitemap\n"
            ; TODO use org-list-to-subtree instead
            (org-list-to-org filtered-list))))

(defun venikx/org-publish-sitemap-entry (entry style project)
  "Format for sitemap ENTRY, as a string.
ENTRY is a file name.  STYLE is the style of the sitemap.
PROJECT is the current project."
  (unless (equal entry "404.org")
    (format "[[file:%s][%s]] /%s/"
            entry
            (org-publish-find-title entry project)
            (venikx/format-date-subtitle entry project))))

(defun venikx/format-rss-feed-entry (entry style project)
  "Format ENTRY for the RSS feed.
ENTRY is a file name.  STYLE is either 'list' or 'tree'.
PROJECT is the current project."
  (cond ((not (directory-name-p entry))
         (let* ((file (org-publish--expand-file-name entry project))
                (title (org-publish-find-title entry project))
                (date (format-time-string "%Y-%m-%d" (org-publish-find-date entry project)))
                (link (concat (file-name-sans-extension entry) ".html")))
           (with-temp-buffer
             (insert (format "* [[file:%s][%s]]\n" file title))
             (org-set-property "RSS_PERMALINK" link)
             (org-set-property "PUBDATE" date)
             (insert-file-contents file)
             (buffer-string))))
        ((eq style 'tree)
         ;; Return only last subdir.
         (file-name-nondirectory (directory-file-name entry)))
        (t entry)))

(defun venikx/format-rss-feed (title list)
  "Generate RSS feed, as a string.
TITLE is the title of the RSS feed.  LIST is an internal
representation for the files to include, as returned by
`org-list-to-lisp'.  PROJECT is the current project."
  (concat "#+TITLE: " title "\n\n"
          (org-list-to-subtree list 1 '(:icount "" :istart ""))))

(defun venikx/org-rss-publish-to-rss (plist filename pub-dir)
  "Publish RSS with PLIST, only when FILENAME is 'rss.org'.
PUB-DIR is when the output will be placed."
  (if (equal "rss.org" (file-name-nondirectory filename))
      (org-rss-publish-to-rss plist filename pub-dir)))

(defun venikx/publish-redirect (plist filename pub-dir)
  "Generate redirect files from the old routes to the new.
PLIST contains the project info, FILENAME is the file to publish
and PUB-DIR the output directory."
  (let* ((regexp (org-make-options-regexp '("REDIRECT_FROM")))
         (from (with-temp-buffer
                 (insert-file-contents filename)
                 (if (re-search-forward regexp nil t)
		     (org-element-property :value (org-element-at-point))))))
    (when from
      (let* ((to-name (file-name-sans-extension (file-name-nondirectory filename)))
             (to-file (format "/%s.html" to-name))
             (from-dir (concat pub-dir from))
             (from-file (concat from-dir "index.html"))
             (other-dir (concat pub-dir to-name))
             (other-file (concat other-dir "/index.html"))
             (to (concat (file-name-sans-extension (file-name-nondirectory filename))
                         ".html"))
             (layout (plist-get plist :redirect-layout))
             (content (with-temp-buffer
                        (insert-file-contents layout)
                        (while (re-search-forward "REDIRECT_TO" nil t)
                          (replace-match to-file t t))
                        (buffer-string))))
        (make-directory from-dir t)
        (make-directory other-dir t)
        (with-temp-file from-file
          (insert content)
          (write-file other-file))))))


(defvar venikx/publish-project-alist
      (list
       (list "blog-posts"
             :base-directory (expand-file-name "posts" venikx/root)
             :base-extension "org"
             :recursive nil
             :exclude (regexp-opt '("rss.org" "index.org"))
             :publishing-function 'venikx/org-html-publish-to-html
             :publishing-directory (expand-file-name "public" venikx/root)
             :html-head-include-default-style nil
             :html-head-include-scripts nil
             :html-htmlized-css-url "css/style.css"
             :html-preamble-format (venikx/pre-and-postamble-format 'preamble)
             :html-postamble t
             :html-postamble-format (venikx/pre-and-postamble-format 'postamble)
             :html-format-headline-function 'venikx/org-html-format-headline-function
             :html-link-home venikx/url
             :html-home/up-format ""
             :auto-sitemap t
             :sitemap-filename "index.org"
             :sitemap-title venikx/title
             :sitemap-style 'list
             :sitemap-sort-files 'anti-chronologically
             :sitemap-function 'venikx/org-publish-sitemap
             :sitemap-format-entry 'venikx/org-publish-sitemap-entry
             :author "Kevin Rangel"
             :email "code@venikx.com"
             :meta-image "content/me.jpg"
             :meta-type "article")
       (list "blog-rss"
             :base-directory (expand-file-name "posts" venikx/root)
             :base-extension "org"
             :recursive nil
             :exclude (regexp-opt '("rss.org" "index.org" "404.org"))
             :publishing-function 'venikx/org-rss-publish-to-rss
             :publishing-directory (expand-file-name "public" venikx/root)
             :rss-extension "xml"
             :html-link-home venikx/url
             :html-link-use-abs-url t
             :html-link-org-files-as-html t
             :auto-sitemap t
             :sitemap-filename "rss.org"
             :sitemap-title venikx/title
             :sitemap-style 'list
             :sitemap-sort-files 'anti-chronologically
             :sitemap-function 'venikx/format-rss-feed
             :sitemap-format-entry 'venikx/format-rss-feed-entry
             :author "Kevin Rangel"
             :email "code@venikx.com")
       (list "blog-static"
             :base-directory venikx/root
             :exclude (regexp-opt '("public/" "layouts/"))
             :base-extension venikx/site-attachments
             :publishing-directory (expand-file-name "public" venikx/root)
             :publishing-function 'org-publish-attachment
             :recursive t)
       (list "blog-acme"
             :base-directory (expand-file-name ".well-known" venikx/root)
             :base-extension 'any
             :publishing-directory (expand-file-name "public/.well-known" venikx/root)
             :publishing-function 'org-publish-attachment
             :recursive t)
       (list "blog-redirects"
             :base-directory (expand-file-name "posts" venikx/root)
             :base-extension "org"
             :recursive nil
             :exclude (regexp-opt '("rss.org" "index.org" "404.org"))
             :publishing-function 'venikx/publish-redirect
             :publishing-directory (expand-file-name "public" venikx/root)
             :redirect-layout (expand-file-name "layouts/redirect.html" venikx/root))
       (list "site"
             :components '("blog-posts" "blog-rss" "blog-static" "blog-acme" "blog-redirects"))
       ))

(defun venikx-publish-all ()
  "Publish the blog to HTML."
  (interactive)
  (let ((org-publish-project-alist       venikx/publish-project-alist)
        (org-publish-timestamp-directory "./.timestamps/")
        (org-export-with-section-numbers nil)
        (org-export-with-smart-quotes    t)
        (org-export-with-toc             nil)
        (org-export-with-sub-superscripts '{})
        (org-html-divs '((preamble  "header" "top")
                         (content   "main"   "content")
                         (postamble "footer" "postamble")))
        (org-html-container-element         "section")
        (org-html-metadata-timestamp-format "%Y-%m-%d")
        (org-html-checkbox-type             'html)
        (org-html-html5-fancy               t)
        (org-html-validation-link           nil)
        (org-html-doctype                   "html5")
        (org-html-htmlize-output-type       'css)
        (org-confirm-babel-evaluate))
    (org-publish-all)))

;;; publish.el ends here
