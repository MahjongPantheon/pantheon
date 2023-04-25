# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon_mimir' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Mimir container$(NC) ~> $$PS1" && cd /var/www/html/Mimir && /bin/sh' ; \
	fi

.PHONY: kill
kill:
	docker rmi pantheon_tyr

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
	php vendor/bin/phpcs --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcs --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcs --ignore=*/generated/*,src/TwirpServer.php src tests www
	php vendor/bin/phpstan clear-result-cache && php vendor/bin/phpstan analyse -c phpstan.neon

.PHONY: unit
unit:
	php bin/unit.php

.PHONY: unit_covered
unit_covered: lint
	phpdbg -qrr bin/unit.php  --testdox --coverage-clover=/tmp/coverage-mimir.xml

check: lint unit

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
		PGPASSWORD=pgpass psql -h127.0.0.1 -p5532 -U mimir mimir_unit -c "DROP TABLE $$p"; \
	done < ./data/tablelist.txt || true

.PHONY: docker_hooks
docker_hooks: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make hooks' ; \
	fi

.PHONY: docker_deps
docker_deps: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make deps' ; \
	fi

.PHONY: docker_lint
docker_lint: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make lint' ; \
	fi

.PHONY: docker_unit
docker_unit: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make unit' ; \
	fi

.PHONY: docker_unit_covered
docker_unit_covered: get_docker_id lint
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make unit_covered' ; \
	fi

.PHONY: docker_check
docker_check: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make check' ; \
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
