{ lib
, rustPlatform
, fetchCrate
, nodejs
, pkg-config
, openssl
, stdenv
, curl
#, Security
, runCommand
}:

rustPlatform.buildRustPackage rec {
  pname = "wasm-bindgen-cli";
  #version = "0.2.84";
  version = "0.2.86";

  src = fetchCrate {
    inherit pname version;
    #sha256 = "sha256-0rK+Yx4/Jy44Fw5VwJ3tG243ZsyOIBBehYU54XP/JGk=";
    sha256 = "sha256-56EOiLbdgAcoTrkyvB3t9TjtLaRvGxFUXx4haLwE2QY=";
  };

  #cargoSha256 = "sha256-vcpxcRlW1OKoD64owFF6mkxSqmNrvY+y3Ckn5UwEQ50=";
  cargoSha256 = "sha256-4CPBmz92PuPN6KeGDTdYPAf5+vTFk9EN5Cmx4QJy6yI=";

  nativeBuildInputs = [ pkg-config ];

  buildInputs = [ openssl ]; # ++ lib.optionals stdenv.isDarwin [ curl Security ];

  nativeCheckInputs = [ nodejs ];

  # other tests require it to be ran in the wasm-bindgen monorepo
  #cargoTestFlags = [ "--test wasm-bindgen" ];

  dontCargoCheck = true;

  meta = with lib; {
    homepage = "https://rustwasm.github.io/docs/wasm-bindgen/";
    license = with licenses; [ asl20 /* or */ mit ];
    description = "Facilitating high-level interactions between wasm modules and JavaScript";
    maintainers = with maintainers; [ nitsky rizary ];
    mainProgram = "wasm-bindgen";
  };
}
