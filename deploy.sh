#!/bin/bash

# ----------------------
# KUDU Deployment Script
# Version: 0.1.11
# ----------------------

# Helpers
# -------

exitWithMessageOnError () {
  if [ ! $? -eq 0 ]; then
    echo "An error has occurred during web site deployment."
    echo $1
    exit 1
  fi
}

# Prerequisites
# -------------

# Verify node.js installed
hash node 2>/dev/null
exitWithMessageOnError "Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment."

# Verify that we have access to tar
hash tar 2> /dev/null
exitWithMessageOnError "Missing tar. I figured as much."

# Setup
# -----
echo Copy assets to $DEPLOYMENT_TEMP for build
tar cf - --exclude=node_modules --exclude=bower_components --exclude=dist --exclude=tmp --exclude=.git . | (cd $DEPLOYMENT_TEMP && tar xvf - )
exitWithMessageOnError "Failed to create and extract tarball"

echo Switch to the temp directory
cd $DEPLOYMENT_TEMP

if [[ -d node_modules ]]; then
  echo Removing node_modules folder
  rm -Rf node_modules
  exitWithMessageOnError "node_modules removal failed"
fi

SCRIPT_DIR="${BASH_SOURCE[0]%\\*}"
SCRIPT_DIR="${SCRIPT_DIR%/*}"
ARTIFACTS=$SCRIPT_DIR/../artifacts
KUDU_SYNC_CMD=${KUDU_SYNC_CMD//\"}
NODE_EXE="$PROGRAMFILES\\nodejs\\0.10.32\\node.exe"
NPM_CMD="\"$NODE_EXE\" \"$PROGRAMFILES\\npm\\1.4.28\\node_modules\\npm\\bin\\npm-cli.js\""
NODE_MODULES_DIR="$APPDATA\\npm\\node_modules"

EMBER_PATH="$NODE_MODULES_DIR\\ember-cli\\bin\\ember"
BOWER_PATH="$NODE_MODULES_DIR\\bower\\bin\\bower"
AZUREDEPLOY_PATH="$NODE_MODULES_DIR\\ember-cli-azure-deploy\\bin\\azure-deploy"

EMBER_CMD="\"$NODE_EXE\" \"$EMBER_PATH\""
BOWER_CMD="\"$NODE_EXE\" \"$BOWER_PATH\""
AZUREDEPLOY_CMD="\"$NODE_EXE\" \"$AZUREDEPLOY_PATH\""

if [[ ! -n "$DEPLOYMENT_SOURCE" ]]; then
  DEPLOYMENT_SOURCE=$SCRIPT_DIR
fi

if [[ ! -n "$NEXT_MANIFEST_PATH" ]]; then
  NEXT_MANIFEST_PATH=$ARTIFACTS/manifest

  if [[ ! -n "$PREVIOUS_MANIFEST_PATH" ]]; then
    PREVIOUS_MANIFEST_PATH=$NEXT_MANIFEST_PATH
  fi
fi

# if [[ -d node_modules ]]; then
#   echo Removing old node_modules folder
#   rm -Rf node_modules
#   exitWithMessageOnError "node_modules removal failed"
# fi

if [[ ! -n "$DEPLOYMENT_TARGET" ]]; then
  DEPLOYMENT_TARGET=$ARTIFACTS/wwwroot
else
  KUDU_SERVICE=true
fi

if [[ ! -n "$KUDU_SYNC_CMD" ]]; then
  # Install kudu sync
  echo Installing Kudu Sync
  npm install kudusync -g --silent
  exitWithMessageOnError "npm failed"

  if [[ ! -n "$KUDU_SERVICE" ]]; then
    # In case we are running locally this is the correct location of kuduSync
    KUDU_SYNC_CMD=kuduSync
  else
    # In case we are running on kudu service this is the correct location of kuduSync
    KUDU_SYNC_CMD=$APPDATA/npm/node_modules/kuduSync/bin/kuduSync
  fi
fi

if [[ ! -e "$EMBER_PATH" ]]; then
  echo Installing ember-cli
  eval $NPM_CMD install -g ember-cli
  exitWithMessageOnError "ember-cli failed"
else
  echo ember-cli already installed, nothing to do
fi

if [[ ! -e "$BOWER_PATH" ]]; then
  echo Installing bower
  eval $NPM_CMD install -g bower
  exitWithMessageOnError "bower failed"
else
  echo bower already installed, nothing to do
fi

if [[ ! -e "$AZUREDEPLOY_PATH" ]]; then
  echo Installing ember-cli-azure-deploy
  eval $NPM_CMD install -g ember-cli-azure-deploy
  exitWithMessageOnError "ember-cli-azure-deploy failed"
else
  echo ember-cli-azure-deploy already installed, nothing to do
fi

##################################################################################################################################
# Build
# -----

echo Installing npm modules
eval $NPM_CMD install --no-optional
exitWithMessageOnError "npm install failed"

echo Installing bower dependencies
eval $BOWER_CMD install
exitWithMessageOnError "bower install failed"

echo Build the dist folder
eval $AZUREDEPLOY_CMD build
exitWithMessageOnError "ember-cli-azure-deploy build failed"

echo Copy web.config to the dist folder
cp web.config dist\

##################################################################################################################################
# Deployment
# ----------

if [[ "$IN_PLACE_DEPLOYMENT" -ne "1" ]]; then
  "$KUDU_SYNC_CMD" -v 50 -f "$DEPLOYMENT_TEMP/dist" -t "$DEPLOYMENT_TARGET" -n "$NEXT_MANIFEST_PATH" -p "$PREVIOUS_MANIFEST_PATH" -i ".git;.hg;.deployment;deploy.sh"
  exitWithMessageOnError "Kudu Sync failed"
fi

##################################################################################################################################
# Post deployment stub
# --------------------

if [[ -n "$POST_DEPLOYMENT_ACTION" ]]; then
  POST_DEPLOYMENT_ACTION=${POST_DEPLOYMENT_ACTION//\"}
  cd "${POST_DEPLOYMENT_ACTION_DIR%\\*}"
  "$POST_DEPLOYMENT_ACTION"
  exitWithMessageOnError "post deployment action failed"
fi

echo "Finished successfully."