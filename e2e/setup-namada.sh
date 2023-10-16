#!/usr/bin/env bash

NAMADA_DIR="$HOME/src/namada"
NAMADA_BIN_DIR="${NAMADA_DIR}/target/debug"
NAMADA_BASE_DIR=".namada/basedir"
OS="Linux"

(cd $NAMADA_DIR && nix develop -c make build)

if [[ $OSTYPE == "darwin"* ]]; then
    OS="Darwin"
fi

# Clear the basedir
rm -rf $NAMADA_BASE_DIR

"${NAMADA_BIN_DIR}/namadac" --base-dir $NAMADA_BASE_DIR utils init-network \
    --chain-prefix dev-test \
    --wasm-checksums-path "${NAMADA_DIR}/checksums.json" \
    --genesis-path genesis.toml \
    --dont-archive \
    --unsafe-dont-encrypt

CONFIG="${NAMADA_BASE_DIR}/global-config.toml"
CHAIN_ID=""

# Read CHAIN_ID from global-config.toml
while read -r line;
do
    CHAIN_ID=$(echo "$line" | sed "s/default_chain_id = \"//g" | sed "s/\"//");

done < "$CONFIG"

# Copy wasms
cp -f ${NAMADA_DIR}/wasm/*.wasm ${NAMADA_BASE_DIR}/${CHAIN_ID}/setup/validator-0/.namada/${CHAIN_ID}/wasm/
cp -f ${NAMADA_DIR}/wasm/*.wasm ${NAMADA_BASE_DIR}/${CHAIN_ID}/wasm/

echo "Fixing CORS"
find ${NAMADA_BASE_DIR} -type f -name "config.toml" -exec sed -i -E "s/cors_allowed_origins[[:space:]]=[[:space:]]\[\]/cors_allowed_origins = [\"*\"]/g" {} +

echo "Moving wallet"
cp ${NAMADA_BASE_DIR}/${CHAIN_ID}/setup/other/wallet.toml ${NAMADA_BASE_DIR}/${CHAIN_ID}

echo "Writing chain ID to .env"
sed -i -E "s/(REACT_APP_NAMADA_CHAIN_ID=).*/\1$CHAIN_ID/" ../apps/namada-interface/.env
