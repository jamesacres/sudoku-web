rm -rf dist
rm -rf out
npm install
IS_CAPACITOR=true next build
npx cap sync