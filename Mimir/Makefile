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
	$(eval RUNNING_CONTAINER_ID := $(shell $(CONTAINER_COMMAND) ps | grep 'pantheon' | grep 'mimir' | awk '{print $$1}'))

.PHONY: shell
shell: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't get to shell.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -it $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && /bin/sh -l' ; \
	fi

.PHONY: migrate
migrate:
	pnpm exec mikro-orm-esm migration:up

.PHONY: container_migrate
container_migrate: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't run migrations.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make migrate'; \
	fi

.PHONY: container_migrate_mimir1
container_migrate_mimir1: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't run migrations.${NC}"; \
	else \
	  $(CONTAINER_COMMAND) exec $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user pnpm exec mikro-orm-esm schema:drop --run --drop-migrations-table'; \
		$(CONTAINER_COMMAND) exec $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user pnpm exec mikro-orm-esm migration:up'; \
		$(CONTAINER_COMMAND) exec $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user time pnpm exec tsx src/migrate_from_mimir1.ts'; \
	fi

.PHONY: logs
logs: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't view logs.${NC}"; \
	else \
		$(CONTAINER_COMMAND) logs -f $(RUNNING_CONTAINER_ID); \
	fi

.PHONY: deps
deps:
	pnpm install
	cd ../Common/tsclients && pnpm install

.PHONY: container_deps
container_deps: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make deps' ; \
	fi

.PHONY: oxlint
oxlint:
	echo "======= Mimir: oxlint ======"
	pnpm exec oxlint .

.PHONY: container_oxlint
container_oxlint: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make oxlint' ; \
	fi

.PHONY: oxfmt
oxfmt:
	echo "======= Mimir: oxfmt ======"
	pnpm exec oxfmt --check

.PHONY: container_oxfmt
container_oxfmt: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make oxfmt' ; \
	fi

.PHONY: typecheck
typecheck:
	echo "======= Mimir: typecheck ======"
	pnpm exec tsc --project tsconfig.json --noEmit

.PHONY: container_typecheck
container_typecheck: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make typecheck' ; \
	fi

.PHONY: test
test: export NODE_OPTIONS=--experimental-vm-modules
test:
	echo "======= Mimir: test ======"
	#make seed_test_db
	pnpm exec jest --coverage --runInBand
	#node --inspect=0.0.0.0:4411 node_modules/jest/bin/jest.js --runInBand -t 'Mimir Twirp API'

.PHONY: container_test
container_test: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make test' ; \
	fi

.PHONY: test_verbose
test_verbose: export TEST_VERBOSE=true
test: export NODE_OPTIONS=--experimental-vm-modules
test_verbose:
	echo "======= Mimir: test ======"
	make init_test_db
	pnpm exec jest

.PHONY: container_test_verbose
container_test_verbose: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make test_verbose' ; \
	fi

.PHONY: run_test_server
run_test_server: export TEST=true
run_test_server: export TEST_VERBOSE=true
run_test_server:
	@echo "${GREEN}Running test server on port 4401${NC}"
	@echo "Use node inspector in your browser (chrome://inspect or similar) to connect to the test server"
	@echo "Use 'make test_noserver' in separate terminal to run jest on already started server"
	pnpm exec tsx watch --inspect=0.0.0.0:4401/debug src/tests/testserver.ts

.PHONY: container_run_test_server
container_run_test_server: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make run_test_server' ; \
	fi

.PHONY: test_noserver
test_noserver: export TEST=true
test_noserver: export NO_SERVER=true
test_noserver: export NODE_OPTIONS=--experimental-vm-modules
test_noserver:
	echo "======= Mimir: test_noserver ======"
	pnpm exec jest

.PHONY: container_test_noserver
container_test_noserver: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make test_noserver' ; \
	fi

.PHONY: autofix
autofix:
	pnpm exec oxlint . --fix
	pnpm exec oxfmt

.PHONY: container_autofix
container_autofix: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make autofix' ; \
	fi

dev:
	pnpm exec tsx watch --inspect=0.0.0.0:4201/debug src/server.ts

.PHONY: container_dev
container_dev: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make dev' ; \
	fi

.PHONY: init_test_db
init_test_db:
	DB_MIMIR_NAME=mimir2_unit pnpm exec mikro-orm-esm schema:drop --run --drop-migrations-table
	DB_MIMIR_NAME=mimir2_unit pnpm exec mikro-orm-esm migration:up

.PHONY: container_init_test_db
container_init_test_db: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make init_test_db' ; \
	fi

.PHONY: bootstrap_admin
bootstrap_admin:
	pnpm exec tsx src/database/bootstrap_admin.ts

.PHONY: container_bootstrap_admin
container_bootstrap_admin: get_container_id container_migrate
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't run bootstrapping.${NC}"; \
	else \
	  $(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make bootstrap_admin' ; \
	fi

.PHONY: seed_test_db
seed_test_db: export TEST=true
seed_test_db: clean_test_db migrate
	pnpm exec mikro-orm-esm seeder:run --class=TestSeeder

.PHONY: container_seed_test_db
container_seed_test_db: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running, can't run seeding.${NC}"; \
	else \
	  $(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make seed_test_db' ; \
	fi

.PHONY: clean_test_db
clean_test_db: export TEST=true
clean_test_db:
	pnpm exec mikro-orm-esm schema:drop --run --drop-migrations-table

.PHONY: container_clean_test_db
container_clean_test_db: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make clean_test_db' ; \
	fi

.PHONY: reload
reload:
	supervisorctl restart mimir:

.PHONY: container_reload
container_reload: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make reload' ; \
	fi

.PHONY: build
build:
	mkdir -p dist
	pnpm exec tsx build.ts

.PHONY: container_build
container_build: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make build' ; \
	fi

.PHONY: prod_deps
prod_deps:
	cd ../Mimir-dist && NODE_ENV=production pnpm install

.PHONY: container_prod_deps
container_prod_deps: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make prod_deps' ; \
	fi

.PHONY: common_deps
common_deps:
	cd ../Common/tsclients && NODE_ENV=production pnpm install

.PHONY: container_common_deps
container_common_deps: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make common_deps' ; \
	fi


.PHONY: prebuild
prebuild:
	cp -f dist/server.js ../Mimir-dist/
	if [ -f .env.production ]; then cp -f .env.production ../Mimir-dist/ ; fi
	cp -f package.json ../Mimir-dist/
	cp -f pnpm-lock.yaml ../Mimir-dist/

.PHONY: container_prebuild
container_prebuild: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make prebuild' ; \
	fi

.PHONY: proto_gen
proto_gen:
	pnpm exec twirpscript

.PHONY: container_proto_gen
container_proto_gen: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user make proto_gen' ; \
	fi

.PHONY: kill
kill:
	$(CONTAINER_COMMAND) rmi `$(CONTAINER_COMMAND) images | grep 'pantheon' | grep 'mimir' | awk '{print $$3}'` || exit 0

.PHONY: container_stop
container_stop: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'killall node' ; \
	fi

.PHONY: container_dump_users
container_dump_users: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Mimir container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Mimir && HOME=/home/user su-exec user cat /tmp/dump_users.txt' ; \
	fi
