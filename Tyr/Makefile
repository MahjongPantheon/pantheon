CONTAINER_COMMAND := $(shell if [ -f "`which docker`" ]; \
  then echo 'docker'; \
  else echo 'podman'; \
fi)

# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_container_id
get_container_id:
	$(eval RUNNING_CONTAINER_ID := $(shell $(CONTAINER_COMMAND) ps | grep 'pantheon' | grep 'tyr' | awk '{print $$1}'))

.PHONY: shell
shell: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running, can't get to shell.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -it $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && /bin/sh -l' ; \
	fi

.PHONY: kill
kill:
	$(CONTAINER_COMMAND) rmi `$(CONTAINER_COMMAND) images | grep 'pantheon' | grep 'tyr' | awk '{print $$3}'` || exit 0

PHONY: deps
deps:
	if [ -e "`which pnpm`" ]; then pnpm install; else npm install; fi

.PHONY: test
test:
	echo "======= Tyr: test ======"
	./node_modules/.bin/vitest --run

.PHONY: container_test
container_test: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make test' ; \
	fi

.PHONY: test_verbose
test_verbose: export TEST_VERBOSE=true
test_verbose:
	echo "======= Tyr: test ======"
	./node_modules/.bin/vitest --run

.PHONY: container_test_verbose
container_test_verbose: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make test_verbose' ; \
	fi

PHONY: eslint
eslint:
	echo "======= Tyr: eslint ======"
	./node_modules/.bin/eslint .

PHONY: container_eslint
container_eslint: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make eslint' ; \
	fi

PHONY: prettier
prettier:
	echo "======= Tyr: prettier ======"
	./node_modules/.bin/prettier -c ./app

PHONY: container_prettier
container_prettier: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make prettier' ; \
	fi

PHONY: typecheck
typecheck:
	echo "======= Tyr: typecheck ======"
	./node_modules/.bin/tsc --project tsconfig.json --noEmit

PHONY: container_typecheck
container_typecheck: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make typecheck' ; \
	fi

PHONY: autofix
autofix:
	./node_modules/.bin/eslint . --fix
	./node_modules/.bin/prettier -w ./app

PHONY: build
build:
	./node_modules/.bin/tsc
	rm -rf ./node_modules/.vite
	./node_modules/.bin/vite build --outDir dist

PHONY: cleanup_prebuilts
cleanup_prebuilts:
	# clean all generated bundle files except last 30
	cd ../Tyr-dist && find -name '*.js' -or -name '*.css' -or -name '*.js.gz' -or -name '*.css.gz' | tail -n +30 | xargs -I {} rm {}

.PHONY: prebuild
prebuild:
	cd dist/assets && gzip -k -9 -f *.js *.css
	cd dist && \
	cp -R * ../../Tyr-dist/ && \
	cp ../pwa-192x192.png ../../Tyr-dist/ && \
	cp ../pwa-512x512.png ../../Tyr-dist/

.PHONY: dev
dev:
	./node_modules/.bin/vite --clearScreen=false

PHONY: i18n_extract
i18n_extract:
	./node_modules/.bin/stex -s 'app/**/*.?(ts|tsx)' -o app/i18n/messages.pot.json
	./node_modules/.bin/jsonpo -s app/i18n/messages.pot.json -o app/i18n/messages.pot --printOccurences
	rm app/i18n/messages.pot.json
	msgmerge -s -U ./app/i18n/ru.po ./app/i18n/messages.pot --backup=none
	msgmerge -s -U ./app/i18n/ema.po ./app/i18n/messages.pot --backup=none
	msgmerge -s -U ./app/i18n/de.po ./app/i18n/messages.pot --backup=none
	msgmerge -s -U ./app/i18n/cn.po ./app/i18n/messages.pot --backup=none
	msgmerge -s -U ./app/i18n/jp.po ./app/i18n/messages.pot --backup=none
	msgmerge -s -U ./app/i18n/ko.po ./app/i18n/messages.pot --backup=none

PHONY: i18n_update
i18n_update:
	./node_modules/.bin/pojson -s app/i18n/ru.po -o app/i18n/ru.json --withMeta
	./node_modules/.bin/pojson -s app/i18n/de.po -o app/i18n/de.json --withMeta
	./node_modules/.bin/pojson -s app/i18n/ema.po -o app/i18n/ema.json --withMeta
	./node_modules/.bin/pojson -s app/i18n/jp.po -o app/i18n/jp.json --withMeta
	./node_modules/.bin/pojson -s app/i18n/cn.po -o app/i18n/cn.json --withMeta
	./node_modules/.bin/pojson -s app/i18n/ko.po -o app/i18n/ko.json --withMeta

PHONY: proto_gen
proto_gen:
	./node_modules/.bin/twirpscript

.PHONY: container_dev
container_dev: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make dev' ; \
	fi

.PHONY: container_stop
container_stop: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'killall node' ; \
	fi

PHONY: container_deps
container_deps: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make deps' ; \
	fi

PHONY: container_autofix
container_autofix: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make autofix' ; \
	fi

PHONY: container_build
container_build: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make build' ; \
	fi

PHONY: container_cleanup_prebuilts
container_cleanup_prebuilts: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make cleanup_prebuilts' ; \
	fi

.PHONY: container_prebuild
container_prebuild: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make prebuild' ; \
	fi

PHONY: container_i18n_extract
container_i18n_extract: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make i18n_extract' ; \
	fi

PHONY: container_i18n_update
container_i18n_update: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make i18n_update' ; \
	fi

PHONY: container_proto_gen
container_proto_gen: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make proto_gen' ; \
	fi
