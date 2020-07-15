#!/usr/bin/sh
./pack-min.sh
rm zips/*.zip
tools/kzip.exe //b512 zips/min_kzip.zip min.html
tools/advzip.exe -a -4 -i 10000 zips/min_advzip.zip min.html
