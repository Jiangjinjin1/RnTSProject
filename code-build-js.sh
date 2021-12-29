#!/bin/bash
#read env
mkdir dest
yarn install

react_native="node_modules/react-native/local-cli/cli.js"

if [ "$1"x = "android"x ] ; then
  mkdir dest/assets
  node $react_native bundle --assets-dest ./dest/ --bundle-output ./dest/assets/index.android.bundle --dev false --entry-file index.js --platform android
fi

if [ "$1"x = "ios"x ] ; then
  node $react_native bundle --assets-dest ./dest --bundle-output ./dest/main.jsbundle --dev false --entry-file index.js --platform ios
fi


