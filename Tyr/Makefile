deps:
	if [ -e "`which yarn`" ]; then yarn; else npm install; fi

build:
	./node_modules/.bin/ng build --prod --aot --env=prod
	cd dist && gzip -9 -f *.js *.css

cleanup_prebuilts:
	# clean all generated bundle files except last 20
	cd ../Tyr-prebuilt && ls -t *bundle* | tail -n +20 | xargs -I {} rm {}

prebuild:
	cd dist && \
	cp -R * ../../Tyr-prebuilt/

dev:
	./node_modules/.bin/ng serve

docker:
	./node_modules/.bin/ng serve --env=docker
