UID := $(shell id -u $$SUDO_USER)
UID ?= $(shell id -u $$USER)

# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep pantheondev | awk '{print $$1}'))

.PHONY: get_docker_idle_id
get_docker_idle_id:
	$(eval IDLE_DOCKER_ID := $(shell docker ps -a | grep pantheondev | awk '{print $$1}'))

.PHONY: get_pgadmin_id
get_pgadmin_id:
	$(eval RUNNING_PGADMIN_ID := $(shell docker ps | grep pgadmin4 | grep 5632 | awk '{print $$1}'))

.PHONY: get_pgadmin_idle_id
get_pgadmin_idle_id:
	$(eval IDLE_PGADMIN_ID := $(shell docker ps -a | grep pgadmin4 | grep 5632 | awk '{print $$1}'))

.PHONY: deps
deps: get_docker_id
	@echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't make deps. Do 'make run' before.${NC}"; \
	else \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user gosu user make deps'; \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user gosu user make deps'; \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user gosu user make deps'; \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user gosu user make deps'; \
	fi

.PHONY: kill
kill: stop get_docker_idle_id get_pgadmin_idle_id
	@if [ "$(IDLE_DOCKER_ID)" != "" ]; then \
		docker rm $(IDLE_DOCKER_ID) ; \
	fi ; \
	if [ "$(IDLE_PGADMIN_ID)" != "" ]; then \
		docker rm $(IDLE_PGADMIN_ID) ; \
	fi

.PHONY: container
container: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."; \
		docker build -t pantheondev . ; \
	else \
		echo "${RED}Pantheon container is running, you must stop it before rebuild.${NC}"; \
	fi


# Alias for conformity
.PHONY: start
start: run

.PHONY: pgadmin_start
pgadmin_start: get_pgadmin_id get_pgadmin_idle_id
	@if [ "$(RUNNING_PGADMIN_ID)" != "" ]; then \
		echo "${YELLOW}Pantheon pgadmin container have already been started.${NC}"; \
	else \
		if [ "$(IDLE_PGADMIN_ID)" != "" ]; then \
			docker start $(IDLE_PGADMIN_ID) ; \
		else \
			docker pull dpage/pgadmin4 && \
			docker run --link=pantheondev -p 5632:80 \
				-e "PGADMIN_DEFAULT_EMAIL=dev@pantheon.local" \
				-e "PGADMIN_DEFAULT_PASSWORD=password" \
				-d dpage/pgadmin4 \
				pantheonpgadmin; \
		fi \
	fi

.PHONY: pgadmin_stop
pgadmin_stop: get_pgadmin_id
	@if [ "$(RUNNING_PGADMIN_ID)" = "" ]; then \
		echo "${RED}Pantheon pgadmin container is not running, can't stop it.${NC}"; \
	else \
		echo "${GREEN}Stopping pgadmin container...${NC}"; \
		docker kill $(RUNNING_PGADMIN_ID); \
	fi

.PHONY: pantheon_run
pantheon_run: get_docker_id get_docker_idle_id
	@if [ "$(RUNNING_DOCKER_ID)" != "" ]; then \
		echo "${YELLOW}Pantheon containers have already been started.${NC}"; \
	else \
		echo "----------------------------------------------------------------------------------"; \
		echo "${GREEN}Starting container. Don't forget to run 'make stop' to stop it when you're done :)${NC}"; \
		echo "----------------------------------------------------------------------------------"; \
		echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."; \
		echo "- ${YELLOW}Mimir API${NC} is exposed on port 4001"; \
		echo "- ${YELLOW}Rheda${NC} is accessible on port 4002 (http://localhost:4002) and is set up to use local Mimir"; \
		echo "- ${YELLOW}Tyr${NC} is accessible on port 4003 (http://localhost:4003) as angular dev server."; \
		echo "- ${YELLOW}Frey${NC} is exposed on port 4004"; \
  		echo "----------------------------------------------------------------------------------"; \
  		echo "- ${YELLOW}PostgreSQL${NC} is exposed on port 5532 of local host"; \
  		echo "- ${YELLOW}PgAdmin4${NC} is exposed on port 5632 (http://localhost:5632)"; \
  		echo "    -> Login to PgAdmin4 as: "; \
  		echo "    ->     Username: dev@pantheon.local "; \
  		echo "    ->     Password: password "; \
  		echo "    -> PgAdmin4 pgsql connection credentials hint: "; \
  		echo "    ->     Hostname: pantheondev "; \
  		echo "    ->     Port:     5532 "; \
  		echo "    ->     Username: mimir "; \
  		echo "    ->     Password: pgpass "; \
  		echo "----------------------------------------------------------------------------------"; \
  		echo " ${GREEN}Run 'make logs' in separate console to view container logs on-line${NC} "; \
  		echo " ${GREEN}Run 'make php_logs' in separate console to view php logs on-line${NC} "; \
  		echo " ${YELLOW}Run 'make shell' in separate console to get into container shell${NC} "; \
  		echo "----------------------------------------------------------------------------------"; \
		if [ "$(IDLE_DOCKER_ID)" != "" ]; then \
  			docker start $(IDLE_DOCKER_ID) ; \
  		else \
			docker run \
				-d -e LOCAL_USER_ID=$(UID) \
				-p 127.0.0.1:4001:4001 -p 127.0.0.1:4002:4002 -p 127.0.0.1:4003:4003 -p 127.0.0.1:4004:4004 -p 127.0.0.1:5532:5532 \
				-v `pwd`/Tyr:/var/www/html/Tyr:z \
				-v `pwd`/Mimir:/var/www/html/Mimir:z \
				-v `pwd`/Rheda:/var/www/html/Rheda:z \
				-v `pwd`/Frey:/var/www/html/Frey:z \
				--name=pantheondev \
				pantheondev; \
		fi \
	fi

.PHONY: pantheon_stop
pantheon_stop: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't stop it.${NC}"; \
	else \
		echo "${GREEN}Stopping all the party...${NC}"; \
		docker kill $(RUNNING_DOCKER_ID); \
	fi

.PHONY: run
run: pantheon_run pgadmin_start

.PHONY: stop
stop: pantheon_stop pgadmin_stop

.PHONY: ngdev
ngdev: get_docker_id
	@docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user gosu user make docker'

.PHONY: dev
dev: run
	${MAKE} deps
	${MAKE} migrate
	${MAKE} ngdev

.PHONY: migrate
migrate: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't run migrations.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user gosu user bin/phinx migrate -e docker'; \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user gosu user bin/phinx migrate -e docker'; \
	fi

.PHONY: open_container
open_container: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't open it.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh; \
	fi

.PHONY: seed
seed: get_docker_id migrate
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't run seeding.${NC}"; \
	else \
	  docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user gosu user bin/phinx seed:run -e docker -s BasicSeeder'; \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user gosu user bin/phinx seed:run -e docker -s ClubEventSeeder'; \
	fi

.PHONY: seed_tournament
seed_tournament: get_docker_id migrate
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't run seeding.${NC}"; \
	else \
	  docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user gosu user bin/phinx seed:run -e docker -s BasicSeeder'; \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user gosu user bin/phinx seed:run -e docker -s TournamentSeeder'; \
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
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'tail -f /var/log/php-errors.log' ; \
	fi

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Pantheon container$(NC) ~> $$PS1" && /bin/sh' ; \
	fi

# Some shortcuts for common tasks

.PHONY: empty_event
empty_event: migrate
		@curl -s http://localhost:4001/ \
		-H 'content-type: application/json' \
		-d '{"jsonrpc": "2.0", "method": "createEvent", "params": ["Test offline", "description", "offline", "ema", 90, "Europe/Moscow"], "id": "5db41fc6-5947-423c-a2ca-6e7f7e6a45c0" }' \
		| php -r 'echo "New event: http://localhost:4002/eid" . json_decode(file_get_contents("php://stdin"))->result . PHP_EOL;'

.PHONY: check
check: get_docker_id
	docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user gosu user make check';
	docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user gosu user make check';
	docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user gosu user make check';
	# TODO: checks for Tyr

.PHONY: run_single_mimir_test
run_single_mimir_test: get_docker_id
	@if [ -z "${NAME}" ]; then \
		echo "${RED}Error: NAME is required.${NC} Typical command usage is: ${GREEN}make run_single_mimir_test NAME=myTestMethodName${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user gosu user php bin/unit.php --filter=${NAME}' ; \
	fi

.PHONY: autofix
autofix:
	cd Mimir && make autofix
	cd Rheda && make autofix
	cd Frey && make autofix

# Prod related tasks & shortcuts

.PHONY: prod_deps
prod_deps:
	cd Mimir && make deps
	cd Rheda && make deps
	cd Frey && make deps

.PHONY: prod_build_tyr
prod_build_tyr: get_docker_id # this is for automated travis builds, don't run it manually
	@if [ "$(TRAVIS_BRANCH)" = "master" ] && [ "$(TRAVIS_PULL_REQUEST)" = "false" ]; then \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user gosu user make deps && make build'; \
		cd Tyr && make cleanup_prebuilts && make prebuild ; \
	fi

# i18n related
.PHONY: i18n_extract
i18n_extract: get_docker_id
	docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user gosu user make i18n_extract';
	# TODO: tyr i18n
