NAMADA_BIN_DIR="$HOME/src/namada/target/debug"
NAMADA_BASE_DIR=".namada/basedir"

$NAMADA_BIN_DIR/namada --base-dir $NAMADA_BASE_DIR "$@"
