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

.PHONY: deps
deps: get_docker_id
	@echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't make deps. Do 'make run' before.${NC}"; \
	else \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user gosu user make deps'; \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user gosu user make deps'; \
		docker exec $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user gosu user make deps'; \
	fi

.PHONY: container
container: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" != "" ]; then \
		echo "${RED}Pantheon container is up, you should stop it before rebuild.${NC}"; \
	else \
		echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."; \
		docker build -t pantheondev . ; \
	fi

.PHONY: run
run: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" != "" ]; then \
		echo "${YELLOW}Pantheon containers have already been started.${NC}"; \
	else \
		echo "----------------------------------------------------------------------------------"; \
		echo "${GREEN}Starting container. Don't forget to run 'make stop' to stop it when you're done :)${NC}"; \
		echo "----------------------------------------------------------------------------------"; \
		echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."; \
		echo "- ${YELLOW}PostgreSQL${NC} is exposed on port 5532 of local host"; \
		echo "- ${YELLOW}Mimir API${NC} is exposed on port 4001"; \
		echo "- ${YELLOW}Rheda${NC} is accessible on port 4002 (http://localhost:4002) and is set up to use local Mimir"; \
		echo "- ${YELLOW}Tyr${NC} is accessible on port 4003 (http://localhost:4003) as angular dev server."; \
		echo "----------------------------------------------------------------------------------"; \
		echo " ${GREEN}Run 'make logs' in separate console to view container logs on-line${NC} "; \
		echo " ${YELLOW}Run 'make shell' in separate console to get into container shell${NC} "; \
		echo "----------------------------------------------------------------------------------"; \
		docker run \
			-d -e LOCAL_USER_ID=$(UID) \
			-p4001:4001 -p4002:4002 -p4003:4003 -p5532:5532 \
			-v `pwd`/Tyr:/var/www/html/Tyr:z \
			-v `pwd`/Mimir:/var/www/html/Mimir:z \
			-v `pwd`/Rheda:/var/www/html/Rheda:z \
			pantheondev; \
	fi

.PHONY: stop
stop: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't stop it.${NC}"; \
	else \
		echo "${GREEN}Stopping all the party...${NC}"; \
		docker kill $(RUNNING_DOCKER_ID); \
	fi

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
	fi

.PHONY: seed
seed: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't run seeding.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user gosu user bin/phinx seed:run -e docker'; \
	fi

.PHONY: logs
logs: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Pantheon container is not running, can't view logs.${NC}"; \
	else \
		docker logs -f $(RUNNING_DOCKER_ID); \
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
empty_event:
		@curl -s http://localhost:4001/ \
		-H 'content-type: application/json' \
		-d '{"jsonrpc": "2.0", "method": "createEvent", "params": ["Test offline", "description", "offline", "ema", 90, 1], "id": "5db41fc6-5947-423c-a2ca-6e7f7e6a45c0" }' \
		| php -r 'echo "New event: http://localhost:4002/eid" . json_decode(file_get_contents("php://stdin"))->result . PHP_EOL;'

.PHONY: check
check: get_docker_id
	docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user gosu user make check';
	docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user gosu user make check';
	# TODO: checks for Tyr

.PHONY: autofix
autofix: get_docker_id
	docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user gosu user make autofix';
	docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Rheda && HOME=/home/user gosu user make autofix';

# Prod related tasks & shortcuts

.PHONY: prod_deps
prod_deps:
	cd Mimir && make deps
	cd Rheda && make deps

.PHONY: prod_build_tyr
prod_build_tyr: get_docker_id # this is for automated travis builds, don't run it manually
	$(eval CURRENT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD))
	@if [ "$(CURRENT_BRANCH)" = "master" ]; then \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Tyr && HOME=/home/user gosu user make deps && make build'; \
		cd Tyr && make cleanup_prebuilts && make prebuild ; \
	else \
		exit 1 ; \
	fi
	# we should exit with error to prevent push to repo from travis on non-master branches

