#!/bin/bash
rm -rf dist
rm -rf out
npm install
IS_ELECTRON=true next build
cd electron
npm install
cd ..
cp -R electron app
cp -R out app/out
electron-builder
rm -rf app