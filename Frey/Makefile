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
	$(eval RUNNING_CONTAINER_ID := $(shell $(CONTAINER_COMMAND) ps | grep 'pantheon' | grep 'frey' | awk '{print $$1}'))

.PHONY: shell
shell: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running, can't get to shell.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -it $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && /bin/sh -l' ; \
	fi

.PHONY: kill
kill:
	$(CONTAINER_COMMAND) rmi `$(CONTAINER_COMMAND) images | grep 'pantheon' | grep 'frey' | awk '{print $$3}'` || exit 0

.PHONY: container_migrate
container_migrate: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running, can't run migrations.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user pnpm exec tsx app/database/migrate.ts'; \
	fi

.PHONY: container_migrate_frey1
container_migrate_frey1: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running, can't run migrations.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user pnpm exec tsx app/database/migrate.ts'; \
		$(CONTAINER_COMMAND) exec $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user pnpm exec tsx app/database/migrate_from_frey1.ts'; \
	fi

.PHONY: logs
logs: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running, can't view logs.${NC}"; \
	else \
		$(CONTAINER_COMMAND) logs -f $(RUNNING_CONTAINER_ID); \
	fi

.PHONY: deps
deps:
	pnpm install

.PHONY: eslint
eslint:
	echo "======= Frey: eslint ======"
	pnpm exec eslint .

.PHONY: container_eslint
container_eslint: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make eslint' ; \
	fi

.PHONY: prettier
prettier:
	echo "======= Frey: prettier ======"
	pnpm exec prettier -c ./app

.PHONY: container_prettier
container_prettier: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make prettier' ; \
	fi

.PHONY: typecheck
typecheck:
	echo "======= Frey: typecheck ======"
	pnpm exec tsc --project tsconfig.json --noEmit

.PHONY: container_typecheck
container_typecheck: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make typecheck' ; \
	fi

.PHONY: test
test:
	echo "======= Frey: test ======"
	pnpm exec jest

.PHONY: container_test
container_test: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make test' ; \
	fi

.PHONY: test_verbose
test_verbose: export TEST_VERBOSE=true
test_verbose:
	echo "======= Frey: test ======"
	pnpm exec jest

.PHONY: container_test_verbose
container_test_verbose: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make test_verbose' ; \
	fi

.PHONY: run_test_server
run_test_server: export TEST_VERBOSE=true
run_test_server:
	@echo "${GREEN}Running test server on port 4404${NC}"
	@echo "Use node inspector in your browser (chrome://inspect or similar) to connect to the test server"
	@echo "Use 'make test_noserver' in separate terminal to run jest on already started server"
	pnpm exec tsx watch --inspect=0.0.0.0:4404/debug app/tests/testserver.ts

.PHONY: container_run_test_server
container_run_test_server: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
	  echo "${GREEN}Running test server on port 4404${NC}"; \
		echo "Use node inspector in your browser (chrome://inspect or similar) to connect to the test server"; \
		echo "Use 'make container_test_noserver' in separate terminal to run jest on already started server"; \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user pnpm exec tsx watch --inspect=0.0.0.0:4404/debug app/tests/testserver.ts' ; \
	fi

.PHONY: test_noserver
test_noserver: export DEBUG=true
test_noserver:
	echo "======= Frey: test_noserver ======"
	pnpm exec jest

.PHONY: container_test_noserver
container_test_noserver: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make test_noserver' ; \
	fi

.PHONY: autofix
autofix:
	pnpm exec eslint . --fix
	pnpm exec prettier -w ./app

dev:
	pnpm exec tsx watch --inspect=0.0.0.0:4204/debug app/server.ts

.PHONY: init_test_db
init_test_db:
	DB_FREY_NAME=frey2_unit pnpm exec tsx app/database/migrate.ts

.PHONY: bootstrap_admin
bootstrap_admin:
	pnpm exec tsx app/database/bootstrap_admin.ts

.PHONY: clean_test_db
clean_test_db:
	pnpm exec tsx app/database/clean_test_db.ts

.PHONY: reload_pm2
reload_pm2:
	HOME=/home/user su-exec user pm2 restart all
	HOME=/home/user su-exec user pm2 scale server 8 || exit 0

.PHONY: container_init_test_db
container_init_test_db: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make init_test_db' ; \
	fi

.PHONY: container_clean_test_db
container_clean_test_db: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make clean_test_db' ; \
	fi

.PHONY: container_bootstrap_admin
container_bootstrap_admin: get_container_id container_migrate
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running, can't run seeding.${NC}"; \
	else \
	  $(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make bootstrap_admin' ; \
	fi

.PHONY: proto_gen
proto_gen:
	pnpm exec twirpscript

.PHONY: container_dev
container_dev: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make dev' ; \
	fi

.PHONY: container_stop
container_stop: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'killall node' ; \
	fi

.PHONY: container_deps
container_deps: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make deps' ; \
	fi

.PHONY: container_prod_deps
container_prod_deps: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make prod_deps' ; \
	fi

.PHONY: container_autofix
container_autofix: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make autofix' ; \
	fi

.PHONY: container_build
container_build: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make build' ; \
	fi

.PHONY: container_prebuild
container_prebuild: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make prebuild' ; \
	fi

.PHONY: container_reload_pm2
container_reload_pm2: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make reload_pm2' ; \
	fi

.PHONY: container_proto_gen
container_proto_gen: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make proto_gen' ; \
	fi
