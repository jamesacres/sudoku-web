#!/bin/bash
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home
rm -rf apps/sudoku/dist
rm -rf apps/sudoku/out
npm install
cd apps/sudoku
IS_CAPACITOR=true npm run build
cd ../..
npx cap sync