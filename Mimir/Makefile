# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon' | grep 'mimir' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && /bin/sh -l' ; \
	fi

.PHONY: kill
kill:
	docker rmi `docker images | grep 'pantheon' | grep 'mimir' | awk '{print $$3}'` || exit 0

.PHONY: docker_migrate
docker_migrate: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't run migrations.${NC}"; \
	else \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user bin/phinx migrate -e docker'; \
	fi

.PHONY: logs
logs: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't view logs.${NC}"; \
	else \
		docker logs -f $(RUNNING_DOCKER_ID); \
	fi

.PHONY: php_logs
php_logs: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't view logs.${NC}"; \
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
	echo "======= Hugin: lint (php codestyle) ======"
	php vendor/bin/phpcs --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcs --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcs --ignore=*/generated/*,src/TwirpServer.php src tests www

.PHONY: docker_lint
docker_lint: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make lint' ; \
	fi

.PHONY: analyze
analyze:
	echo "======= Mimir: lint (php static analyzer) ======"
	php vendor/bin/phpstan clear-result-cache && php vendor/bin/phpstan analyse -c phpstan.neon

.PHONY: docker_analyze
docker_analyze: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make analyze' ; \
	fi

.PHONY: test
test:
	php bin/unit.php

.PHONY: docker_test
docker_test: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make test' ; \
	fi

.PHONY: autofix
autofix:
	php vendor/bin/phpcbf --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcbf --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcbf src tests www

.PHONY: init_test_db
init_test_db:
	echo "Initializing test db..."
	@php bin/phinx migrate -e testing

.PHONY: clean_test_db
clean_test_db:
	echo "Cleaning test db..."
	while read p; do \
		PGPASSWORD=pgpass psql -hdb.pantheon.internal -p5432 -U mimir mimir_unit -c "DROP TABLE $$p"; \
	done < ./data/tablelist.txt || true

.PHONY: enable_debug
enable_debug:
	@echo -ne "zend_extension=xdebug.so\n \
		xdebug.mode=debug\n \
		xdebug.client_host=172.17.0.1\n \
		xdebug.client_port=9001\n" > /etc/php83/conf.d/50_xdebug.ini
	$(shell kill -SIGUSR2 `ps ax | grep php-fpm | grep master | awk '{print $$1}'`)

.PHONY: docker_enable_debug
docker_enable_debug: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't enable debug.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && make enable_debug'; \
	fi

.PHONY: docker_hooks
docker_hooks: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make hooks' ; \
	fi

.PHONY: docker_proto_gen
docker_proto_gen: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Common && HOME=/home/user su-exec user make proto_gen' ; \
	fi

.PHONY: docker_deps
docker_deps: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make deps' ; \
	fi

.PHONY: docker_autofix
docker_autofix: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make autofix' ; \
	fi

.PHONY: docker_init_test_db
docker_init_test_db: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make init_test_db' ; \
	fi

.PHONY: docker_clean_test_db
docker_clean_test_db: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make clean_test_db' ; \
	fi

.PHONY: docker_seed
docker_seed: get_docker_id docker_migrate
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't run seeding.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user bin/phinx seed:run -e docker -s ClubEventSeeder --verbose'; \
	fi

.PHONY: docker_seed_bigevent
docker_seed_bigevent: get_docker_id docker_migrate
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't run seeding.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && SEED_REPEAT=20 HOME=/home/user su-exec user bin/phinx seed:run -e docker -s ClubEventSeeder --verbose'; \
	fi

.PHONY: docker_seed_tournament
docker_seed_tournament: get_docker_id docker_migrate
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't run seeding.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user bin/phinx seed:run -e docker -s TournamentSeeder --verbose'; \
	fi
