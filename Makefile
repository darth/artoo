all: www/alert/bundle.js www/voice/bundle.js www/system/bundle.js www/countdown/bundle.js

www/alert/bundle.js: www/alert/main.js
	browserify $< -o $@

www/voice/bundle.js: www/voice/main.js
	browserify $< -o $@

www/system/bundle.js: www/system/main.js
	browserify $< -o $@

www/countdown/bundle.js: www/countdown/main.js
	browserify $< -o $@
