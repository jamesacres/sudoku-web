#!/bin/bash
rm -rf "apps/$1/dist"
rm -rf "apps/$1/out"
rm -rf "apps/$1/app"
npm install
cd "apps/$1"
IS_ELECTRON=true npm run build
cd electron
npm install
cd ..
cp -R electron app
cp -R out app/out
electron-builder
rm -rf app
cd ../..