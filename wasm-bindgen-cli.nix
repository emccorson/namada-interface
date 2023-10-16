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
  version = "0.2.87";

  # Note when bumping version:
  # There are two hashes: `sha256` and `cargo256`, but `nix develop`
  # isn't nice about telling you which one is wrong. So to upgrade,
  # just bump the version, and when `nix develop` throws an error,
  # check the hash it got and replace that one. It will error twice
  # and you'll need to replace both.

  src = fetchCrate {
    inherit pname version;
    # sha256 = "sha256-0rK+Yx4/Jy44Fw5VwJ3tG243ZsyOIBBehYU54XP/JGk=";
    sha256 = "sha256-0u9bl+FkXEK2b54n7/l9JOCtKo+pb42GF9E1EnAUQa0=";
  };

  #cargoSha256 = "sha256-vcpxcRlW1OKoD64owFF6mkxSqmNrvY+y3Ckn5UwEQ50=";
  cargoSha256 = "sha256-AsZBtE2qHJqQtuCt/wCAgOoxYMfvDh8IzBPAOkYSYko=";

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
