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
	$(eval RUNNING_CONTAINER_ID := $(shell $(CONTAINER_COMMAND) ps | grep 'pantheon' | grep 'hugin' | awk '{print $$1}'))

.PHONY: shell
shell: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running, can't get to shell.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -it $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Hugin && /bin/sh -l' ; \
	fi

.PHONY: kill
kill:
	$(CONTAINER_COMMAND) rmi `$(CONTAINER_COMMAND) images | grep 'pantheon' | grep 'hugin' | awk '{print $$3}'` || exit 0

.PHONY: enable_debug
enable_debug:
	@echo -ne "zend_extension=xdebug.so\n \
		xdebug.mode=debug\n \
		xdebug.client_host=172.17.0.1\n \
		xdebug.client_port=9001\n" > /etc/php83/conf.d/50_xdebug.ini
	$(shell kill -SIGUSR2 `ps ax| grep php-fpm | grep master | awk '{print $$1}'`)

.PHONY: disable_debug
disable_debug:
	@echo "" > /etc/php83/conf.d/50_xdebug.ini
	$(shell kill -SIGUSR2 `ps ax | grep php-fpm | grep master | awk '{print $$1}'`)

.PHONY: container_disable_debug
container_disable_debug: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running, can't disable debug.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Hugin && make disable_debug'; \
	fi

.PHONY: container_enable_debug
container_enable_debug: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running, can't enable debug.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Hugin && make enable_debug'; \
	fi

.PHONY: container_seed
container_seed: get_container_id container_migrate
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running, can't run seeding.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Hugin && HOME=/home/user su-exec user bin/phinx seed:run -e docker -s TestEventsSeeder --verbose'; \
	fi

.PHONY: container_migrate
container_migrate: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running, can't run migrations.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Hugin && HOME=/home/user su-exec user bin/phinx migrate -e docker'; \
	fi

.PHONY: logs
logs: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running, can't view logs.${NC}"; \
	else \
		$(CONTAINER_COMMAND) logs -f $(RUNNING_CONTAINER_ID); \
	fi

.PHONY: php_logs
php_logs: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running, can't view logs.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -it $(RUNNING_CONTAINER_ID) sh -c 'tail -f /var/log/php-errors.log | grep -v xdebug' ; \
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
	echo "======= Hugin: lint (php codestyle) ======"
	php vendor/bin/phpcs --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcs --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcs --ignore=*/generated/*,src/TwirpServer.php src www

.PHONY: container_lint
container_lint: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Hugin && HOME=/home/user su-exec user make lint' ; \
	fi

.PHONY: analyze
analyze:
	echo "======= Hugin: lint (php static analyzer) ======"
	php vendor/bin/phpstan clear-result-cache && php vendor/bin/phpstan analyse -c phpstan.neon

.PHONY: container_analyze
container_analyze: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Hugin && HOME=/home/user su-exec user make analyze' ; \
	fi

.PHONY: autofix
autofix:
	php vendor/bin/phpcbf --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcbf --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcbf src www

.PHONY: init_test_db
init_test_db:
	@bin/phinx migrate -e testing

.PHONY: clean_test_db
clean_test_db:
	while read p; do \
		PGPASSWORD=pgpass psql -hdb.pantheon.internal -U hugin hugin_unit -c "DROP TABLE \"$$p\""; \
	done < ./data/tablelist.txt || true

.PHONY: container_deps
container_deps: get_container_id
		@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
  		echo "${RED}Hugin container is not running.${NC}"; \
  	else \
  		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Hugin && HOME=/home/user su-exec user make deps' ; \
  	fi

.PHONY: container_autofix
container_autofix: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Hugin && HOME=/home/user su-exec user make autofix' ; \
	fi

.PHONY: container_init_test_db
container_init_test_db: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Hugin && HOME=/home/user su-exec user make init_test_db' ; \
	fi

.PHONY: container_clean_test_db
container_clean_test_db: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Hugin container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Hugin && HOME=/home/user su-exec user make clean_test_db' ; \
	fi
