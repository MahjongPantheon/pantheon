# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon' | grep 'sigrun' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Sigrun container$(NC) ~> $$PS1" && cd /var/www/html/Sigrun && /bin/sh' ; \
	fi

.PHONY: kill
kill:
	docker rmi `docker images | grep 'pantheon' | grep 'sigrun' | awk '{print $$1}'`

PHONY: deps
deps:
	if [ -e "`which yarn`" ]; then yarn; else npm install; fi

PHONY: lint
lint:
	make -k -j4 typecheck eslint prettier

PHONY: eslint
eslint:
	./node_modules/.bin/eslint . --ext .js,.ts,.tsx

PHONY: prettier
prettier:
	./node_modules/.bin/prettier -c ./src

PHONY: typecheck
typecheck:
	./node_modules/.bin/tsc --project tsconfig.json --noEmit

PHONY: test
test:
	./node_modules/.bin/vitest --run

PHONY: autofix
autofix:
	./node_modules/.bin/eslint . --ext .js,.ts,.tsx --fix
	./node_modules/.bin/prettier -w ./src

PHONY: build
build:
	./node_modules/.bin/tsc
	rm -rf ./node_modules/.vite
	./node_modules/.bin/vite build --outDir dist/client
	./node_modules/.bin/vite build --ssr src/server.tsx --outDir dist/server

.PHONY: prod_deps
prod_deps:
	cd ../Sigrun-dist && NODE_ENV=production yarn install

.PHONY: prebuild
prebuild:
	cd dist/client/assets && gzip -k -9 -f *.js *.css
	cp -R dist ../Sigrun-dist/
	cp -f server.js ../Sigrun-dist/
	cp -f .env.production ../Sigrun-dist/
	cp -f package.json ../Sigrun-dist/
	cp -f yarn.lock ../Sigrun-dist/

PHONY: cleanup_prebuilts
cleanup_prebuilts:
	mkdir -p ../Sigrun-dist/dist/client/assets
	# clean all generated bundle files except last 30
	cd ../Sigrun-dist/dist/client/assets && find -name '*.js' -or -name '*.css' -or -name '*.js.gz' -or -name '*.css.gz' | tail -n +30 | xargs -I {} rm {}

dev:
	./node_modules/.bin/vite --clearScreen=false

PHONY: i18n_extract
i18n_extract:
	./node_modules/.bin/stex -s 'src/**/*.?(ts|tsx)' -o src/i18n/messages.pot.json
	./node_modules/.bin/jsonpo -s src/i18n/messages.pot.json -o src/i18n/messages.pot --printOccurences
	rm src/i18n/messages.pot.json
	msgmerge -s -U ./src/i18n/ru.po ./src/i18n/messages.pot --backup=none
	#msgmerge -s -U ./src/i18n/de.po ./src/i18n/messages.pot --backup=none

PHONY: i18n_update
i18n_update:
	./node_modules/.bin/pojson -s src/i18n/ru.po -o src/i18n/ru.json --withMeta
	#./node_modules/.bin/pojson -s src/i18n/de.po -o src/i18n/de.json --withMeta

PHONY: reload_pm2
reload_pm2:
	HOME=/home/user su-exec user pm2 restart all
	HOME=/home/user su-exec user pm2 scale server 8 || exit 0

.PHONY: rebuild_ssr
rebuild_ssr:
	HOME=/home/user su-exec user ${MAKE} build
	HOME=/home/user su-exec user ${MAKE} prebuild
	HOME=/home/user su-exec user ${MAKE} reload_pm2

PHONY: proto_gen
proto_gen:
	./node_modules/.bin/twirpscript

.PHONY: docker_dev
docker_dev: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make dev' ; \
	fi

.PHONY: docker_stop
docker_stop: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'killall node' ; \
	fi

PHONY: docker_deps
docker_deps: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make deps' ; \
	fi

PHONY: docker_prod_deps
docker_prod_deps: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make prod_deps' ; \
	fi


PHONY: docker_lint
docker_lint: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make lint' ; \
	fi

PHONY: docker_test
docker_test: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make test' ; \
	fi

PHONY: docker_autofix
docker_autofix: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make autofix' ; \
	fi

PHONY: docker_build
docker_build: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make build' ; \
	fi

PHONY: docker_cleanup_prebuilts
docker_cleanup_prebuilts: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make cleanup_prebuilts' ; \
	fi

PHONY: docker_prebuild
docker_prebuild: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make prebuild' ; \
	fi

PHONY: docker_i18n_extract
docker_i18n_extract: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make i18n_extract' ; \
	fi

PHONY: docker_i18n_update
docker_i18n_update: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make i18n_update' ; \
	fi

PHONY: docker_reload_pm2
docker_reload_pm2: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make reload_pm2' ; \
	fi

PHONY: docker_proto_gen
docker_proto_gen: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Sigrun container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Sigrun && HOME=/home/user su-exec user make proto_gen' ; \
	fi
