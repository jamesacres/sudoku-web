#!/bin/bash
rm -rf apps/sudoku/dist
rm -rf apps/sudoku/out
rm -rf app
npm install
cd apps/sudoku
IS_ELECTRON=true npm run build
cd ../..
cd electron
npm install
cd ..
cp -R electron app
cp -R apps/sudoku/out app/out
electron-builder
rm -rf app