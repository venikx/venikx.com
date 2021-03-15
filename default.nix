with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "node";
  nativeBuildInputs = [
    autoreconfHook
    pkg-config
  ];

  buildInputs = [
    nasm
    nodejs
  ];
  shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
    '';
}
