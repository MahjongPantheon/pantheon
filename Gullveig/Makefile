# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon' | grep 'gullveig' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Gullveig && /bin/sh -l' ; \
	fi

.PHONY: kill
kill:
	docker rmi `docker images | grep 'pantheon' | grep 'gullveig' | awk '{print $$3}'` || exit 0

.PHONY: enable_debug
enable_debug:
	@echo -ne "zend_extension=xdebug.so\n \
		xdebug.mode=debug\n \
		xdebug.client_host=172.17.0.1\n \
		xdebug.client_port=9001\n" > /etc/php81/conf.d/50_xdebug.ini
	$(shell kill -SIGUSR2 `ps ax| grep php-fpm | grep master | awk '{print $$1}'`)

.PHONY: docker_enable_debug
docker_enable_debug: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running, can't enable debug.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Gullveig && make enable_debug'; \
	fi

.PHONY: logs
logs: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running, can't view logs.${NC}"; \
	else \
		docker logs -f $(RUNNING_DOCKER_ID); \
	fi

.PHONY: php_logs
php_logs: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running, can't view logs.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'tail -f /var/log/php-errors.log | grep -v xdebug' ; \
	fi

.PHONY: hooks
hooks:
	if [ -d .git ]; then \
		cp -prf bin/hooks/* .git/hooks; \
		chmod a+x .git/hooks/*; \
	fi

.PHONY: hooks
deps: hooks
	php bin/composer.phar install

.PHONY: lint
lint:
	echo "======= Gullveig: lint (php codestyle) ======"
	php vendor/bin/phpcs --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcs --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcs --ignore=*/generated/* src www

.PHONY: docker_lint
docker_lint: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make lint' ; \
	fi

.PHONY: analyze
analyze:
	echo "======= Gullveig: lint (php static analyzer) ======"
	php vendor/bin/phpstan clear-result-cache && php vendor/bin/phpstan analyse -c phpstan.neon

.PHONY: docker_analyze
docker_analyze: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make analyze' ; \
	fi

.PHONY: autofix
autofix:
	php vendor/bin/phpcbf --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcbf --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcbf src www

.PHONY: docker_deps
docker_deps: get_docker_id
		@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
  		echo "${RED}Gullveig container is not running.${NC}"; \
  	else \
  		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make deps' ; \
  	fi

.PHONY: docker_autofix
docker_autofix: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make autofix' ; \
	fi
