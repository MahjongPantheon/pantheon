PHONY: deps
deps:
	if [ -e "`which yarn`" ]; then yarn; else npm install; fi

PHONY: build
build:
	NODE_ENV=production ./node_modules/.bin/webpack --config webpack.prod.js
	cp app/tyrico.png dist
	cd dist && gzip -k -9 -f *.js *.css

PHONY: cleanup_prebuilts
cleanup_prebuilts:
	# clean all generated bundle files except last 30
	cd ../Tyr-dist && find -name *.js -or -name *.css -or -name *.js.gz -or -name *.css.gz | tail -n +30 | xargs -I {} rm {}

prebuild:
	cd dist && \
	cp -R * ../../Tyr-dist/

dev:
	rm -rf dist
	./node_modules/.bin/webpack-dev-server --config webpack.dev.js

docker: dev

PHONY: i18n_extract
i18n_extract:
	./node_modules/.bin/stex -s 'app/**/*.?(ts|tsx)' -o app/i18n/messages.pot.json
	./node_modules/.bin/jsonpo -s app/i18n/messages.pot.json -o app/i18n/messages.pot --printOccurences
	rm app/i18n/messages.pot.json
	msgmerge -s -U ./app/i18n/ru.po ./app/i18n/messages.pot --backup=none

PHONY: i18n_update
i18n_update:
	./node_modules/.bin/pojson -s app/i18n/ru.po -o app/i18n/ru.json --withMeta
	./node_modules/.bin/pojson -s app/i18n/de.po -o app/i18n/de.json --withMeta
