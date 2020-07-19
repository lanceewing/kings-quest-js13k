#!/usr/bin/sh
cat Logic.js Util.js UserInput.js Sprite.js Actor.js Ego.js ZzFX.micro.js player-small.js Sound.js Game.js | sed 's/this.keys/this.kys/g' | sed 's/this.screen/this.scrn/g' | sed 's/flags/flgs/g' | sed 's/process[(]/prcs(/g' | sed 's/update[(]/updt(/g' | sed 's/setPosition[(]/setPstn(/g' | sed 's/reset[(]/rstt(/g' | sed 's/this.canvas/this.cnvs/g' | sed 's/this.content/this.cntnt/g' | sed 's/hide[(]/_hide(/g' | sed 's/show[(]/shw(/g' | sed 's/this.direction/this.drctn/g' | sed 's/this.heading/this.hdng/g' | sed 's/left[(]/_left(/g' | sed 's/right[(]/_right(/g' | sed 's/init[(]/_init(/g' | sed 's/this.step/this.stp/g' | sed 's/stepFactor/stpFactor/g' | sed 's/move[(]/_move(/g' | sed 's/stop[(]/_stop(/g' | sed 's/start[(]/_start(/g' | sed 's/getItem[(]/getItm(/g' | sed 's/re_move/remove/g' > combined.js
npm run minify-js
rm combined.js
npm run minify-css
cat min_head.html min.css min_mid.html min.js min_foot.html  | tr -d '\n' > min.html
