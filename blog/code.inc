# -- mode: org; --

#+name: pi
#+begin_src shell :exports none
echo 3.14
#+end_src

#+name: short_hello
#+begin_src shell :var line="Hi Everybody" :exports none
echo $line | cut -c1-5
#+end_src
