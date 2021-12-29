#!/bin/bash

echo "玩命打包中..."

yarn install
nowStr=`date '+%m月%d日%H时%M分%S秒'`
desc="($nowStr)$(git log -1 --pretty=%B)"

case $2 in
  "ios")
    echo "jsBundle for ios..."
    code-push release-react MyApp-ios ios -d "$1" --description "$desc"
    ;;
  "android")
    echo "jsBundle for android"
    code-push release-react MyApp-android android -d "$1" --description "$desc"
    ;;
   *)
    echo "not miss matching"
esac
