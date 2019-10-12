PHONY: deps
deps:
	if [ -e "`which yarn`" ]; then yarn; else npm install; fi

PHONY: build
build:
	./node_modules/.bin/ng build --prod --aot --env=prod
	cd dist && gzip -k -9 -f *.js *.css

PHONY: cleanup_prebuilts
cleanup_prebuilts:
	# clean all generated bundle files except last 30
	cd ../Tyr-prebuilt && ls -t *bundle* | tail -n +30 | xargs -I {} rm {}

prebuild:
	cd dist && \
	cp -R * ../../Tyr-prebuilt/

dev:
	./node_modules/.bin/ng serve

docker:
	./node_modules/.bin/ng serve --configuration=docker

PHONY: i18n_extract
i18n_extract:
	./node_modules/.bin/stex -s '**/*.ts' -o src/i18n/messages.pot.json
	./node_modules/.bin/jsonpo -s src/i18n/messages.pot.json -o src/i18n/messages.pot --printOccurences
	rm src/i18n/messages.pot.json

PHONY: i18n_update
i18n_update:
	./node_modules/.bin/pojson -s src/i18n/ru.po -o src/i18n/ru.json --withMeta
