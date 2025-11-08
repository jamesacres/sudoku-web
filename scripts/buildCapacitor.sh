#!/bin/bash
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home
rm -rf "apps/$1/dist"
rm -rf "apps/$1/out"
npm install
cd "apps/$1"
IS_CAPACITOR=true npm run build
npx cap sync
cd ../..