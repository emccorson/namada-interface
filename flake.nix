{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachSystem [ "x86_64-linux" ] (system:
    let
      pkgs = import nixpkgs { inherit system; };
    in
      {
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            rustup
            #wasm-bindgen-cli
            (callPackage ./wasm-bindgen-cli.nix { })
            wasm-pack
            binaryen
            protobuf
            yarn
            nodejs-18_x
            emscripten #using emcc because I can't get gcc or clang to work
            nodePackages.web-ext
            wget
            cargo-watch
          ];
        };
      }
    );
}
