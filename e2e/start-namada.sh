#!/usr/bin/env bash

CURRENT_DIR=$(pwd)

NAMADA_DIR="$HOME/src/namada"
NAMADA_BASE_DIR="$CURRENT_DIR/.namada/basedir"

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
    NAMADA_LOG=debug ENV_VAR_MASP_PARAMS_DIR=$CURRENT_DIR/../masp-params \
                     nix develop -c ./target/debug/namadan --chain-id ${CHAIN_ID} --base-dir ${NAMADA_BASE_DIR}/${CHAIN_ID}/setup/validator-0/.namada ledger
)
