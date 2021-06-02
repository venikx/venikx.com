with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "node";
  nativeBuildInputs = [
    gnumake
    emacs
  ];
}
