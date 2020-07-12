#!/usr/bin/sh
npm run minify-js
npm run minify-css
cat min_head.html min.css min_mid.html min.js min_foot.html  | tr -d '\n' > min.html
