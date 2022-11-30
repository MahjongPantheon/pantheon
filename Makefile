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
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make deps'; \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make deps'; \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make deps'; \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make deps'; \
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
			docker run -it --link=pantheondev -p 5632:80 \
				-e "PGADMIN_DEFAULT_EMAIL=dev@riichi.top" \
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
		echo "- ${YELLOW}Tyr${NC} is accessible on port 4003 (http://localhost:4003) as webpack dev server."; \
		echo "- ${YELLOW}Frey${NC} is exposed on port 4004"; \
  		echo "----------------------------------------------------------------------------------"; \
  		echo "- ${YELLOW}PostgreSQL${NC} is exposed on port 5532 of local host"; \
  		echo "- ${YELLOW}PgAdmin4${NC} is exposed on port 5632 (http://localhost:5632)"; \
  		echo "    -> Login to PgAdmin4 as: "; \
  		echo "    ->     Username: dev@riichi.top "; \
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
  		echo " ${YELLOW}Also you can use 'make shell_{tyr|rheda|frey|mimir}' to get ${NC} "; \
  		echo " ${YELLOW}to specific subproject folder after entering container shell${NC} "; \
  		echo "----------------------------------------------------------------------------------"; \
		if [ "$(IDLE_DOCKER_ID)" != "" ]; then \
  			docker start $(IDLE_DOCKER_ID) ; \
  		else \
			docker run \
				-d -e LOCAL_USER_ID=$(UID) \
				-e COVERALLS_REPO_TOKEN=$(COVERALLS_REPO_TOKEN) \
				-e COVERALLS_RUN_LOCALLY=1 \
				-p 127.0.0.1:4001:4001 \
				-p 127.0.0.1:4002:4002 \
				-p 127.0.0.1:4003:4003 \
				-p 127.0.0.1:4004:4004 \
				-p 127.0.0.1:5532:5532 \
				-p 127.0.0.1:4006:4006 \
				-v `pwd`/Tyr:/var/www/html/Tyr:z \
				-v `pwd`/Mimir:/var/www/html/Mimir:z \
				-v `pwd`/Rheda:/var/www/html/Rheda:z \
				-v `pwd`/Frey:/var/www/html/Frey:z \
				-v `pwd`/Common:/var/www/html/Common:z \
				-v `pwd`/:/var/www/html/pantheon:z \
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
run: pantheon_run# pgadmin_start

.PHONY: stop
stop: pantheon_stop pgadmin_stop

.PHONY: frontdev
frontdev: get_docker_id
	@docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/pantheon/Tyr && HOME=/home/user su-exec user make docker'

.PHONY: dev
dev: run
	@if [ -n $TMUX ]; then \
     tmux split-window -dv '${MAKE} php_logs' ; \
     tmux split-window -dh '${MAKE} rat_logs' ; \
  fi
	${MAKE} deps
	${MAKE} migrate
	${MAKE} frontdev

.PHONY: migrate
migrate: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't run migrations.${NC}"; \
	else \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user bin/phinx migrate -e docker'; \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user bin/phinx migrate -e docker'; \
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
	  docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user bin/phinx seed:run -e docker -s BasicSeeder --verbose'; \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user bin/phinx seed:run -e docker -s ClubEventSeeder --verbose'; \
	fi

.PHONY: seed_tournament
seed_tournament: get_docker_id migrate
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't run seeding.${NC}"; \
	else \
	  docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user bin/phinx seed:run -e docker -s BasicSeeder --verbose'; \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user bin/phinx seed:run -e docker -s TournamentSeeder --verbose'; \
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

.PHONY: rat_logs
rat_logs: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't view logs.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'tail -f /var/log/rat-errors.log' ; \
	fi

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Pantheon container$(NC) ~> $$PS1" && /bin/sh' ; \
	fi

.PHONY: shell_tyr
shell_tyr: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Pantheon container$(NC) ~> $$PS1" && cd /var/www/html/Tyr && /bin/sh' ; \
	fi

.PHONY: shell_rheda
shell_rheda: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Pantheon container$(NC) ~> $$PS1" && cd /var/www/html/Rheda && /bin/sh' ; \
	fi

.PHONY: shell_mimir
shell_mimir: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Pantheon container$(NC) ~> $$PS1" && cd /var/www/html/Mimir && /bin/sh' ; \
	fi

.PHONY: shell_frey
shell_frey: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Pantheon container$(NC) ~> $$PS1" && cd /var/www/html/Frey && /bin/sh' ; \
	fi

.PHONY: dump_users
dump_users: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cat /tmp/frey_tokens_debug' ; \
	fi

# Some shortcuts for common tasks

.PHONY: empty_event
empty_event: migrate
	@curl -s http://localhost:4001 \
		-H 'content-type: application/json' \
		-d '{"jsonrpc": "2.0", "method": "createEvent", "params": ["Test offline", "description", "ema", 90, "Europe/Moscow"], "id": "5db41fc6-5947-423c-a2ca-6e7f7e6a45c0" }' \
		| php -r 'echo "New event: http://localhost:4002/eid" . json_decode(file_get_contents("php://stdin"))->result . PHP_EOL;'

.PHONY: global_admin
global_admin: migrate
		@if [ "${USERID}" = "" ] || [ "${EVENTID}" = "" ]; then \
			echo "Usage: USERID=[id] EVENTID=[id] make global_admin"; \
			echo "Event id should be set to clear access cache immediately. It may be omitted if it is not required"; \
		else \
			curl -s http://localhost:4004/ \
				-H 'content-type: application/json' \
				-d '{"jsonrpc": "2.0", "method": "addSystemWideRuleForPerson", "params": ["admin_event", true, "bool", ${USERID}], "id": "5db41fc6-5947-423c-a2ca-6e7f7e6a45c0" }' && \
			curl -s http://localhost:4004/ \
				-H 'content-type: application/json' \
				-d '{"jsonrpc": "2.0", "method": "clearAccessCache", "params": [${USERID}, ${EVENTID}], "id": "5db41fc6-5947-423c-a2ca-6e7f7e6a45c0" }' ; \
		fi

.PHONY: check
check: get_docker_id lint
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make unit';
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make unit';
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make unit';
	# TODO: checks for Tyr

.PHONY: lint
lint: get_docker_id
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make lint';
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make lint';
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make lint';
	# TODO: checks for Tyr

.PHONY: check_covered
check_covered: get_docker_id lint
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/pantheon/Frey && HOME=/home/user su-exec user make unit_covered';
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/pantheon/Mimir && HOME=/home/user su-exec user make unit_covered';
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/pantheon/Rheda && HOME=/home/user su-exec user make unit_covered';
	# TODO: checks for Tyr
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/pantheon && HOME=/home/user su-exec user php bin/php-coveralls.phar \
	            --json_path=/tmp/coverall.json --coverage_clover=/tmp/coverage-*.xml' || true; # suppress error ftw

.PHONY: run_single_mimir_test
run_single_mimir_test: get_docker_id
	@if [ -z "${NAME}" ]; then \
		echo "${RED}Error: NAME is required.${NC} Typical command usage is: ${GREEN}make run_single_mimir_test NAME=myTestMethodName${NC}"; \
	else \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user php bin/unit.php --filter=${NAME}' ; \
	fi

.PHONY: autofix
autofix: get_docker_id
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make autofix';
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make autofix';
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make autofix';

# Prod related tasks & shortcuts

.PHONY: prod_deps
prod_deps:
	cd Mimir && make deps
	cd Rheda && make deps
	cd Frey && make deps

.PHONY: prod_build_tyr
prod_build_tyr: get_docker_id # this is for automated builds, don't run it manually
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make deps && make build';
	cd Tyr && make cleanup_prebuilts && make prebuild

# i18n related
.PHONY: i18n_extract
i18n_extract: get_docker_id
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make i18n_extract';
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make i18n_extract';

.PHONY: i18n_compile
i18n_compile: get_docker_id
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user su-exec user make i18n_compile';
	docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user su-exec user make i18n_update';
