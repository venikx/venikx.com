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

;; ==========================
;; Setting up Basic Variables
;; ==========================
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
                             '(".git" "assets" "css" "elisp" "layouts" "posts"))))
  "Root directory of this project.")

(defvar venikx/layouts-directory
  (expand-file-name "layouts" venikx/root)
  "Directory where layouts are found.")

;; ==============================
;; Extracting metadata from files
;; ==============================
(defun venikx/post-get-metadata-from-frontmatter (post-filename key)
  "Extract the KEY as`#+KEY:` from POST-FILENAME."
  (let ((case-fold-search t))
    (with-temp-buffer
      (insert-file-contents post-filename)
      (goto-char (point-min))
      (ignore-errors
        (progn
          (search-forward-regexp (format "^\\#\\+%s\\:\s+\\(.+\\)$" key))
          (match-string 1))))))

;; ===========================
;; Setting up Basic Formatting
;; ===========================
(defun venikx/pre-and-postamble-format (type)
  "Return the content for the pre/postamble of TYPE."
  `(("en" ,(with-temp-buffer
             (insert-file-contents (expand-file-name (format "%s.html" type) venikx/layouts-directory))
             (buffer-string)))))

(defun venikx/format-date-subtitle (file project)
  "Format the date found in FILE of PROJECT."
  (format-time-string "%d %B %Y" (org-publish-find-date file project)))

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

;; ================================
;; Helpers for generating meta tags
;; ================================
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
                 ,(venikx/org-html-tag "link" '(rel alternate) '(type application/rss+xml) '(href "posts/rss.xml") '(title "RSS feed"))
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

;; ==========================================
;; Helpers to generate relative path to files
;; ==========================================
(defun venikx/hash-for-filename (filename)
  "Returns the sha25 for FILENAME."
  (with-temp-buffer
    (insert-file-contents filename)
    (secure-hash 'sha256 (current-buffer))))

(defun venikx/asset-relative-link-to (resource pub-dir &optional versioned)
    (let* ((assets-project (assoc "assets" org-publish-project-alist 'string-equal))
           (dst-asset (expand-file-name resource (org-publish-property :publishing-directory assets-project)))
           (asset-relative-to-dst-file (file-relative-name dst-asset pub-dir)))
      (if versioned
          (format "%s?v=%s" asset-relative-to-dst-file
                  (venikx/hash-for-filename (expand-file-name resource venikx/root)))
        dst-asset asset-relative-to-dst-file)))

(defun venikx/project-relative-filename (filename)
  "Return the relative path of FILENAME to the project root."
  (file-relative-name filename venikx/root))

;; ====================================
;; Wrappers to generate the HTML output
;; ====================================
(defun venikx/org-html-publish-post-to-html (plist filename pub-dir)
  "Wrapper function to publish an file to html.

PLIST contains the properties, FILENAME the source file and
  PUB-DIR the output directory."
  (let ((project (cons 'kevr-p plist)))
    (plist-put plist :subtitle
               (venikx/format-date-subtitle filename project))
    (plist-put plist :html-head-extra
               (venikx/html-head-extra filename project))
    (plist-put plist :html-htmlized-css-url
               (venikx/asset-relative-link-to "css/style.css" pub-dir t))
    (org-html-publish-to-html plist filename pub-dir)))

(defun venikx/org-html-publish-site-to-html (plist filename pub-dir)
  "Wrapper function to publish an file to html.

PLIST contains the properties, FILENAME the source file and
  PUB-DIR the output directory."
  (let ((project (cons 'kevr-s plist)))
    (plist-put plist :html-head-extra
               (venikx/html-head-extra filename project))
    (plist-put plist :html-htmlized-css-url
               (venikx/asset-relative-link-to "css/style.css" pub-dir t))
    (org-html-publish-to-html plist filename pub-dir)))

;; ==============================
;; Logic to generate the sitemaps
;; ==============================
(defun venikx/sitemap-format-entry (entry style project)
  "Format for sitemap ENTRY, as a string.
ENTRY is a file name.  STYLE is the style of the sitemap.
PROJECT is the current project."
  (unless (equal entry "404.org")
    (format "[[file:%s][%s]] /%s/"
            entry
            (org-publish-find-title entry project)
            (venikx/format-date-subtitle entry project))))

(defun venikx/latest-posts-sitemap-function (title sitemap)
  "posts.org generation. Only publish the latest 10 posts from SITEMAP (https://orgmode.org/manual/Sitemap.html).  Skips TITLE."
  (let* ((posts (cdr sitemap))
         (last-five (seq-subseq posts 0 (min (length posts) 10))))
    (org-list-to-org (cons (car sitemap) last-five))))

(defun venikx/archive-sitemap-function (title list)
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
            (org-list-to-org filtered-list))))

;; ==============================
;; Logic to generate the RSS feed
;; ==============================
(defun venikx/format-rss-feed-entry (entry style project)
  "Format ENTRY for the RSS feed.
ENTRY is a file name.  STYLE is either 'list' or 'tree'.
PROJECT is the current project."
  (cond ((not (directory-name-p entry))
         (let* ((file (org-publish--expand-file-name entry project))
                (title (org-publish-find-title entry project))
                (description (venikx/post-get-metadata-from-frontmatter file "description"))
                (categories (venikx/post-get-metadata-from-frontmatter file "category"))
                (date (format-time-string "%Y-%m-%d" (org-publish-find-date entry project)))
                (link (concat (file-name-sans-extension entry) ".html")))
           (with-temp-buffer
             (insert (format "* [[file:%s][%s]]\n" file title))
             (goto-char (point-min))
             (org-set-tags categories)
             (goto-char (point-max))
             (org-set-property "RSS_PERMALINK" (concat "posts/" (file-name-sans-extension entry) ".html"))
             (org-set-property "RSS_TITLE" title)
             (org-set-property "PUBDATE" date)
             (insert description)
             (buffer-string))))
        ((eq style 'tree)
         ;; Return only last subdir.
         (file-name-nondirectory (directory-file-name entry)))
        (t entry)))

(defun venikx/format-rss-feed (title sitemap)
  "Generate RSS feed, as a string.
TITLE is the title of the RSS feed.  LIST is an internal
representation for the files to include, as returned by
`org-list-to-lisp'.  PROJECT is the current project."
  (concat "#+title: " title "\n"
          "#+description: Come read what Kevin Rangel writes about. \n"
          "\n"
          (org-list-to-subtree sitemap 1 '(:icount "" :istart ""))))

(defun venikx/org-rss-publish-to-rss (plist filename pub-dir)
  "Wrap org-rss-publish-to-rss with PLIST and PUB-DIR, publishing
only when FILENAME is 'archive.org'."
  (if (equal "rss.org" (file-name-nondirectory filename))
      (org-rss-publish-to-rss plist filename pub-dir)))

;; ===============================
;; Setting the Publishing Pipeline
;; ===============================
(defvar venikx/publish-project-alist
      (list
       (list "blog"
             :base-directory (expand-file-name "posts" venikx/root)
             :base-extension "org"
             :recursive t
             :exclude (regexp-opt '("posts.org" "archive.org" "rss.org"))
             :publishing-function 'venikx/org-html-publish-post-to-html
             :publishing-directory (expand-file-name "public/posts" venikx/root)
             :html-head-include-default-style nil
             :html-head-include-scripts nil
             :html-preamble-format (venikx/pre-and-postamble-format 'preamble)
             :html-postamble t
             :html-postamble-format (venikx/pre-and-postamble-format 'postamble)
             :html-format-headline-function 'venikx/org-html-format-headline-function
             :html-link-home venikx/url
             :html-home/up-format ""
             :auto-sitemap t
             :sitemap-filename "posts.org"
             :sitemap-title nil
             :sitemap-style 'list
             :sitemap-sort-files 'anti-chronologically
             :sitemap-function 'venikx/latest-posts-sitemap-function
             :sitemap-format-entry 'venikx/sitemap-format-entry
             :author "Kevin Rangel"
             :email "code@venikx.com"
             :meta-image "assets/me.jpg"
             :meta-type "article")
       (list "archive"
             :base-directory "./posts"
             :recursive t
             :exclude (regexp-opt '("posts.org" "archive.org" "rss.org"))
             :base-extension "org"
             :publishing-directory "./public"
             :publishing-function 'ignore
             :html-link-home "https://venikx.com/"
             :html-link-use-abs-url t
             :auto-sitemap t
             :sitemap-style 'list
             :sitemap-filename "archive.org"
             :sitemap-sort-files 'anti-chronologically
             :sitemap-function 'venikx/archive-sitemap-function
             :sitemap-format-entry 'venikx/sitemap-format-entry)

       (list "sitemap-for-rss"
             :base-directory "./posts"
             :recursive t
             :exclude (regexp-opt '("posts.org" "archive.org" "rss.org"))
             :base-extension "org"
             :publishing-directory "./public"
             :publishing-function 'ignore
             :auto-sitemap t
             :sitemap-title "Kevin Rangel Blog RSS Feed"
             :sitemap-description "Kevin Rangel Blog RSS Feed"
             :sitemap-style 'list
             :sitemap-function 'venikx/format-rss-feed
             :sitemap-format-entry 'venikx/format-rss-feed-entry
             :author "Kevin Rangel"
             :email "code@venikx.com"
             :sitemap-filename "rss.org")
       (list "rss"
             :base-directory "./"
             :recursive t
             :exclude "."
             :include '("posts/rss.org")
             :exclude (regexp-opt '("posts.org" "archive.org" "rss.org"))
             :base-extension "org"
             :publishing-directory "./public"
             :publishing-function 'venikx/org-rss-publish-to-rss
             :rss-image-url (concat venikx/url "assets/me.jpg")
             :html-link-home venikx/url
             :author "Kevin Rangel"
             :email "code@venikx.com"
             :html-link-use-abs-url t)

       (list "site"
             :base-directory "./"
             :include '("posts/archive.org")
             :base-extension "org"
             :publishing-function 'venikx/org-html-publish-site-to-html
             :publishing-directory (expand-file-name "public" venikx/root)
             :html-head-include-default-style nil
             :html-head-include-scripts nil
             :html-preamble t
             :html-preamble-format (venikx/pre-and-postamble-format 'preamble)
             :html-postamble t
             :html-postamble-format (venikx/pre-and-postamble-format 'postamble)
             :html-format-headline-function 'venikx/org-html-format-headline-function
             :html-link-home venikx/url
             :html-home/up-format ""
             :author "Kevin Rangel"
             :email "code@venikx.com"
             :meta-image "assets/me.jpg"
             :meta-type "article")

       (list "assets"
             :base-directory venikx/root
             :exclude (regexp-opt '("public" "layouts" "assets"))
             :base-extension venikx/site-attachments
             :publishing-directory (expand-file-name "public" venikx/root)
             :publishing-function 'org-publish-attachment
             :recursive t)

       (list "site"
             :components '("blog" "archive" "site" "sitemap-for-rss" "rss" "assets"))
       ))

(defun venikx-publish-all ()
  "Publish the blog to HTML."
  (interactive)
  (let ((org-publish-project-alist       venikx/publish-project-alist)
        (org-publish-use-timestamps-flag nil)
        (org-export-with-section-numbers nil)
        (org-export-with-smart-quotes    t)
        (org-export-with-toc             nil)
        (org-export-with-sub-superscripts '{})
        (org-html-divs '((preamble  "header" "top")
                         (content   "main"   "content")
                         (postamble "footer" "postamble")))
        (org-html-container-element         "section")
        (org-html-metadata-timestamp-format "%d %B %Y")
        (org-html-checkbox-type             'html)
        (org-html-html5-fancy               t)
        (org-html-validation-link           nil)
        (org-html-doctype                   "html5")
        (org-html-htmlize-output-type       'css)
        (org-confirm-babel-evaluate))
    (org-publish-all)))

;;; publish.el ends here
