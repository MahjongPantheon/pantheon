.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon_frey' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Frey container$(NC) ~> $$PS1" && cd /var/www/html/Frey && /bin/sh' ; \
	fi

.PHONY: kill
kill:
	docker rmi pantheon_frey

.PHONY: docker_migrate
docker_migrate: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running, can't run migrations.${NC}"; \
	else \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user bin/phinx migrate -e docker'; \
	fi

.PHONY: logs
logs: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running, can't view logs.${NC}"; \
	else \
		docker logs -f $(RUNNING_DOCKER_ID); \
	fi

.PHONY: php_logs
php_logs: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running, can't view logs.${NC}"; \
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
	php vendor/bin/phpcs --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcs --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcs --ignore=*/generated/*,src/TwirpServer.php src tests www
	php vendor/bin/phpstan clear-result-cache && php vendor/bin/phpstan analyse -c phpstan.neon

.PHONY: unit
unit:
	php bin/unit.php

.PHONY: unit_covered
unit_covered:
	phpdbg -qrr bin/unit.php --testdox --coverage-clover=/tmp/coverage-frey.xml

check: lint unit

.PHONY: autofix
autofix:
	php vendor/bin/phpcbf --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcbf --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcbf src tests www

.PHONY: init_test_db
init_test_db:
	@bin/phinx migrate -e testing

.PHONY: clean_test_db
clean_test_db:
	while read p; do \
		PGPASSWORD=pgpass psql -hdb -p5532 -U frey frey_unit -c "DROP TABLE \"$$p\""; \
	done < ./data/tablelist.txt || true

.PHONY: docker_deps
docker_deps: get_docker_id
		@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
  		echo "${RED}Frey container is not running.${NC}"; \
  	else \
  		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make deps' ; \
  	fi

.PHONY: docker_unit_covered
docker_unit_covered: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make unit_covered' ; \
	fi

.PHONY: docker_check
docker_check: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make check' ; \
	fi

.PHONY: docker_autofix
docker_autofix: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make autofix' ; \
	fi

.PHONY: docker_init_test_db
docker_init_test_db: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make init_test_db' ; \
	fi

.PHONY: docker_clean_test_db
docker_clean_test_db: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make clean_test_db' ; \
	fi

.PHONY: docker_seed
docker_seed: get_docker_id docker_migrate
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running, can't run seeding.${NC}"; \
	else \
	  docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user bin/phinx seed:run -e docker -s BasicSeeder --verbose'; \
	fi

.PHONY: docker_dump_users
docker_dump_users: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cat /tmp/frey_tokens_debug' ; \
	fi
