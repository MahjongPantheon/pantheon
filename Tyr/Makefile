.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon_tyr' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Tyr container$(NC) ~> $$PS1" && cd /var/www/html/Tyr && /bin/sh' ; \
	fi

.PHONY: kill
kill:
	docker rmi pantheon_tyr

PHONY: deps
deps:
	if [ -e "`which yarn`" ]; then yarn; else npm install; fi

PHONY: lint
lint:
	make -k -j4 typecheck eslint prettier

.PHONY: unit
unit:
	./node_modules/.bin/jest

.PHONY: unit_covered
unit_covered:
	./node_modules/.bin/jest

PHONY: eslint
eslint:
	./node_modules/.bin/eslint . --ext .js,.ts,.tsx

PHONY: prettier
prettier:
	./node_modules/.bin/prettier -c ./app

PHONY: typecheck
typecheck:
	./node_modules/.bin/tsc --project tsconfig.json --noEmit

PHONY: autofix
autofix:
	./node_modules/.bin/eslint . --ext .js,.ts,.tsx --fix
	./node_modules/.bin/prettier -w ./app

PHONY: build
build:
	NODE_ENV=production ./node_modules/.bin/webpack --config webpack.prod.js
	cp app/tyrico.png dist
	cd dist && gzip -k -9 -f *.js *.css

PHONY: cleanup_prebuilts
cleanup_prebuilts:
	# clean all generated bundle files except last 30
	cd ../Tyr-dist && find -name *.js -or -name *.css -or -name *.js.gz -or -name *.css.gz | tail -n +30 | xargs -I {} rm {}

.PHONY: prebuild
prebuild:
	cd dist && \
	cp -R * ../../Tyr-dist/

.PHONY: dev
dev:
	rm -rf dist
	./node_modules/.bin/webpack-dev-server --config webpack.dev.js

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

PHONY: proto_gen
proto_gen:
	./node_modules/.bin/twirpscript

.PHONY: docker_dev
docker_dev: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make dev' ; \
	fi

.PHONY: docker_stop
docker_stop: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'killall webpack' ; \
	fi

PHONY: docker_deps
docker_deps: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make deps' ; \
	fi

PHONY: docker_lint
docker_lint: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make lint' ; \
	fi

.PHONY: docker_unit
docker_unit: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make unit' ; \
	fi

.PHONY: docker_unit_covered
docker_unit_covered: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make unit_covered' ; \
	fi

PHONY: docker_autofix
docker_autofix: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make autofix' ; \
	fi

PHONY: docker_build
docker_build: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make build' ; \
	fi

PHONY: docker_cleanup_prebuilts
docker_cleanup_prebuilts: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make cleanup_prebuilts' ; \
	fi

.PHONY: docker_prebuild
docker_prebuild: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make prebuild' ; \
	fi

PHONY: docker_i18n_extract
docker_i18n_extract: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make i18n_extract' ; \
	fi

PHONY: docker_i18n_update
docker_i18n_update: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make i18n_update' ; \
	fi

PHONY: docker_proto_gen
docker_proto_gen: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Tyr container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make proto_gen' ; \
	fi
