#!/bin/sh
jsx --no-cache-dir src/jsx assets/js
minifyjs -m -i assets/js/index.js -o assets/js/index.js.min | minifyjs -m -i assets/js/menu.js -o assets/js/menu.js.min | minifyjs -m -i assets/js/item.js -o assets/js/item.js.min | minifyjs -m -i assets/js/meetoo.js -o assets/js/meetoo.js.min
lessc src/less/index.less > assets/css/index.css | lessc src/less/meetoo.less > assets/css/meetoo.css
uglifycss assets/css/index.css > assets/css/index.css.min | uglifycss assets/css/meetoo.css > assets/css/meetoo.css.min
cp src/html/*.html assets/html/
go-bindata -pkg=bindata -o=src/bindata/bindata.go --ignore=".*.go|.*.less|\.module-cache|.*.un~|\.git|.DS_Store|jsx" assets/...
go-bindata -pkg=debug -debug=true -o=src/bindata/debug/bindata_debug.go --ignore=".*.go|.*.less|\.module-cache|.*.un~|.DS_Store|jsx" assets/...
