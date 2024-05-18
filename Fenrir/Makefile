# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon' | grep 'fenrir' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Fenrir container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Fenrir && /bin/bash --login' ; \
	fi

.PHONY: kill
kill:
	docker rmi `docker images | grep 'pantheon' | grep 'fenrir' | awk '{print $$3}'` || exit 0

PHONY: deps
deps:
	yarn
	yarn playwright install --with-deps

PHONY: lint
lint:
	make -k -j4 typecheck eslint prettier

PHONY: eslint
eslint:
	./node_modules/.bin/eslint --ext .js,.ts,.tsx .

PHONY: prettier
prettier:
	./node_modules/.bin/prettier -c ./tests

PHONY: typecheck
typecheck:
	./node_modules/.bin/tsc --project tsconfig.json --noEmit

PHONY: autofix
autofix:
	./node_modules/.bin/eslint . --ext .js,.ts,.tsx --fix
	./node_modules/.bin/prettier -w ./tests

run:
	env | sort
	CI=true ./node_modules/.bin/playwright test
	@if [ "$(TESTINY_API_KEY)" != "" ]; then \
		testiny-importer testrun --confirm \
			--duplicates folder_title \
			--project PNTN \
			--junit ./test-results/junit-report.xml ; \
	fi

.PHONY: docker_run
docker_run: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Fenrir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c "export TESTINY_API_KEY=\"$(TESTINY_API_KEY)\" && cd /var/www/html/Fenrir && make run" ; \
	fi

PHONY: docker_deps
docker_deps: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Fenrir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Fenrir && make deps' ; \
	fi

PHONY: docker_lint
docker_lint: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Fenrir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Fenrir && make lint' ; \
	fi

PHONY: docker_autofix
docker_autofix: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Fenrir container is not running.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Fenrir && make autofix' ; \
	fi
