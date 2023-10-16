#!/usr/bin/env bash

BASE_PATH=$1
if [[ -z $1 ]]; then
    BASE_PATH="$HOME/src/namada-interface"
fi

NAMADA_DIR="$HOME/src/namada"
NAMADA_BASE_DIR="$BASE_PATH/e2e/.namada/basedir"

echo "NAMADA BASE DIR"
echo $NAMADA_BASE_DIR

CONFIG="${NAMADA_BASE_DIR}/global-config.toml"
CHAIN_ID=""

# Read CHAIN_ID from global-config.toml
while read -r line;
do
    CHAIN_ID=$(echo "$line" | sed "s/default_chain_id = \"//g" | sed "s/\"//");

done < "$CONFIG"

# Start the chain
(
    cd $NAMADA_DIR
    NAMADA_LOG=debug nix develop -c ./target/debug/namadan --chain-id ${CHAIN_ID} --base-dir ${NAMADA_BASE_DIR}/${CHAIN_ID}/setup/validator-0/.namada ledger
)
