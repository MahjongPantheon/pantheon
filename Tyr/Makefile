deps:
	if [ -e "`which yarn`" ]; then yarn; else npm install; fi

build:
	./node_modules/.bin/ng build --prod --aot --env=prod

cleanup:
	# clean all generated bundle files except last 20
	cd ../Tyr-prebuilt && ls -t *bundle* | tail -n +20 | xargs -I {} rm {}

prebuild: build cleanup
	cd dist && \
	gzip -9 -f *.js *.css && \
	cp -R * ../../Tyr-prebuilt/

dev:
	./node_modules/.bin/ng serve

docker:
	./node_modules/.bin/ng serve --env=docker
