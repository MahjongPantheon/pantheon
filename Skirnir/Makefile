# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon' | grep 'skirnir' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && /bin/sh -l' ; \
	fi

.PHONY: kill
kill:
	docker rmi `docker images | grep 'pantheon' | grep 'skirnir' | awk '{print $$3}'` || exit 0

PHONY: deps
deps:
	if [ -e "`which yarn`" ]; then yarn; else npm install; fi

PHONY: eslint
eslint:
	echo "======= Skirnir: eslint ======"
	./node_modules/.bin/eslint .

PHONY: docker_eslint
docker_eslint: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make eslint' ; \
	fi

PHONY: prettier
prettier:
	echo "======= Skirnir: prettier ======"
	./node_modules/.bin/prettier -c ./app

PHONY: docker_prettier
docker_prettier: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make prettier' ; \
	fi

PHONY: typecheck
typecheck:
	echo "======= Skirnir: typecheck ======"
	./node_modules/.bin/tsc --project tsconfig.json --noEmit

PHONY: docker_typecheck
docker_typecheck: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make typecheck' ; \
	fi

PHONY: test
test:
	./node_modules/.bin/vitest --run

PHONY: docker_test
docker_test: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make test' ; \
	fi

PHONY: autofix
autofix:
	./node_modules/.bin/eslint . --fix
	./node_modules/.bin/prettier -w ./app

PHONY: build
build:
	./node_modules/.bin/tsc --outDir dist

.PHONY: prod_deps
prod_deps:
	cd ../Skirnir-dist && NODE_ENV=production yarn install

.PHONY: prebuild
prebuild:
	cp -R dist ../Skirnir-dist/
	cp dist/server.js ../Skirnir-dist/
	if [ -f .env.production ]; then cp -f .env.production ../Skirnir-dist/ ; fi
	if [ -f .env.development ]; then cp -f .env.development ../Skirnir-dist/ ; fi
	cp -f package.json ../Skirnir-dist/
	cp -f yarn.lock ../Skirnir-dist/

dev:
	./node_modules/.bin/nodemon app/server.ts

PHONY: i18n_extract
i18n_extract:
	./node_modules/.bin/stex -s 'app/**/*.?(ts|tsx)' -o app/i18n/messages.pot.json
	./node_modules/.bin/jsonpo -s app/i18n/messages.pot.json -o app/i18n/messages.pot --printOccurences
	rm app/i18n/messages.pot.json
	msgmerge -s -U ./app/i18n/ru.po ./app/i18n/messages.pot --backup=none
	#msgmerge -s -U ./app/i18n/de.po ./app/i18n/messages.pot --backup=none

PHONY: i18n_update
i18n_update:
	./node_modules/.bin/pojson -s app/i18n/ru.po -o app/i18n/ru.json --withMeta
	#./node_modules/.bin/pojson -s app/i18n/de.po -o app/i18n/de.json --withMeta

PHONY: reload_pm2
reload_pm2:
	HOME=/home/user su-exec user pm2 restart all
	HOME=/home/user su-exec user pm2 scale server 1 || exit 0

.PHONY: docker_dev
docker_dev: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make dev' ; \
	fi

.PHONY: docker_stop
docker_stop: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'killall node' ; \
	fi

PHONY: docker_deps
docker_deps: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make deps' ; \
	fi

PHONY: docker_prod_deps
docker_prod_deps: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make prod_deps' ; \
	fi

PHONY: docker_autofix
docker_autofix: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make autofix' ; \
	fi

PHONY: docker_build
docker_build: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make build' ; \
	fi

PHONY: docker_cleanup_prebuilts
docker_cleanup_prebuilts: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make cleanup_prebuilts' ; \
	fi

PHONY: docker_prebuild
docker_prebuild: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make prebuild' ; \
	fi

PHONY: docker_i18n_extract
docker_i18n_extract: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make i18n_extract' ; \
	fi

PHONY: docker_i18n_update
docker_i18n_update: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make i18n_update' ; \
	fi

PHONY: docker_reload_pm2
docker_reload_pm2: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Skirnir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Skirnir && HOME=/home/user su-exec user make reload_pm2' ; \
	fi
