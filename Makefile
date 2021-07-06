all: www/alert/bundle.js www/voice/bundle.js

www/alert/bundle.js: www/alert/main.js
	browserify $< -o $@

www/voice/bundle.js: www/voice/main.js
	browserify $< -o $@
