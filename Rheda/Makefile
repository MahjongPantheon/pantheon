# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon' | grep 'rheda' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Rheda container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Rheda container$(NC) ~> $$PS1" && cd /var/www/html/Rheda && /bin/sh' ; \
	fi

.PHONY: kill
kill:
	docker rmi `docker images | grep 'pantheon' | grep 'rheda' | awk '{print $$1}'`

.PHONY: logs
logs: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Rheda container is not running, can't view logs.${NC}"; \
	else \
		docker logs -f $(RUNNING_DOCKER_ID); \
	fi

.PHONY: php_logs
php_logs: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Rheda container is not running, can't view logs.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'tail -f /var/log/php-errors.log | grep -v xdebug' ; \
	fi

SQLITE_FILE ?= data/db.sqlite

.PHONY: hooks
hooks:
	if [ -d .git ]; then \
		cp -prf bin/hooks/* .git/hooks; \
		chmod a+x .git/hooks/*; \
	fi

.PHONY: deps
deps: hooks
	php bin/composer.phar install

.PHONY: lint
lint:
	php vendor/bin/phpcs --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcs --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcs src www --ignore=www/assets/*
	php vendor/bin/phpstan clear-result-cache && php vendor/bin/phpstan analyse -c phpstan.neon

.PHONY: unit
unit:
	# TODO: unit tests

check: lint unit

.PHONY: autofix
autofix:
	php vendor/bin/phpcbf --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcbf --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcbf src www --ignore=www/assets/*

.PHONY: i18n_extract
i18n_extract:
	rm ./i18n/messages.pot
	touch ./i18n/messages.pot
	find ./src -iname "*.handlebars" -print0 | sort -z | xargs -r0 xgettext-template -L Handlebars --no-location=1 --from-code=UTF-8 --keyword=_t --keyword=_n:1,2 --keyword=_p --keyword=_np:1,2 -j -o i18n/messages.pot
	find ./src -iname "*.php" -print0 | sort -z | xargs -r0 xgettext -j --no-location --keyword=_t --keyword=_n:1,2 --keyword=_p --keyword=_np:1,2 --from-code=UTF-8 -o i18n/messages.pot
	find ../Common -iname "*.php" -print0 | sort -z | xargs -r0 xgettext -j --no-location --keyword=_t --keyword=_n:1,2 --keyword=_p --keyword=_np:1,2 --from-code=UTF-8 -o i18n/messages.pot
	chmod a+w i18n/messages.pot
	msgmerge -s -U ./i18n/de_DE.UTF-8/LC_MESSAGES/messages.po ./i18n/messages.pot --backup=none
	msgmerge -s -U ./i18n/ru_RU.UTF-8/LC_MESSAGES/messages.po ./i18n/messages.pot --backup=none

.PHONY: i18n_compile
i18n_compile:
	msgfmt ./i18n/de_DE.UTF-8/LC_MESSAGES/messages.po -o ./i18n/de_DE.UTF-8/LC_MESSAGES/messages.mo
	msgfmt ./i18n/ru_RU.UTF-8/LC_MESSAGES/messages.po -o ./i18n/ru_RU.UTF-8/LC_MESSAGES/messages.mo

.PHONY: docker_hooks
docker_hooks: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Rheda container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make hooks' ; \
	fi

.PHONY: docker_deps
docker_deps: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Rheda container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make deps' ; \
	fi

.PHONY: docker_lint
docker_lint: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Rheda container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make lint' ; \
	fi

.PHONY: docker_check
docker_check: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Rheda container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make check' ; \
	fi

.PHONY: docker_autofix
docker_autofix: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Rheda container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make autofix' ; \
	fi

.PHONY: docker_i18n_extract
docker_i18n_extract: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Rheda container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make i18n_extract' ; \
	fi

.PHONY: docker_i18n_compile
docker_i18n_compile: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Rheda container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make i18n_compile' ; \
	fi
