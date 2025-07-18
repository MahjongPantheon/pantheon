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

# TODO
#.PHONY: container_migrate
#container_migrate: get_container_id
#	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
#		echo "${RED}Frey container is not running, can't run migrations.${NC}"; \
#	else \
#		$(CONTAINER_COMMAND) exec $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user bin/phinx migrate -e docker'; \
#	fi

.PHONY: logs
logs: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running, can't view logs.${NC}"; \
	else \
		$(CONTAINER_COMMAND) logs -f $(RUNNING_CONTAINER_ID); \
	fi
PHONY: deps
deps:
	if [ -e "`which pnpm`" ]; then pnpm install; else npm install; fi

PHONY: eslint
eslint:
	echo "======= Frey: eslint ======"
	./node_modules/.bin/eslint .

PHONY: container_eslint
container_eslint: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make eslint' ; \
	fi

PHONY: prettier
prettier:
	echo "======= Frey: prettier ======"
	./node_modules/.bin/prettier -c ./app

PHONY: container_prettier
container_prettier: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make prettier' ; \
	fi

PHONY: typecheck
typecheck:
	echo "======= Frey: typecheck ======"
	./node_modules/.bin/tsc --project tsconfig.json --noEmit

PHONY: container_typecheck
container_typecheck: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make typecheck' ; \
	fi

PHONY: test
test:
	echo "======= Frey: test ======"
	./node_modules/.bin/vitest --run

PHONY: container_test
container_test: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make test' ; \
	fi

PHONY: autofix
autofix:
	./node_modules/.bin/eslint . --fix
	./node_modules/.bin/prettier -w ./app

PHONY: build
build:
	./node_modules/.bin/tsc
	rm -rf ./node_modules/.vite
	./node_modules/.bin/vite build --outDir dist/client
	./node_modules/.bin/vite build --ssr app/server.tsx --outDir dist/server

.PHONY: prod_deps
prod_deps:
	cd ../Frey-dist && NODE_ENV=production pnpm install

.PHONY: prebuild
prebuild:
	cp pwa-192x192.png dist/client/
	cp pwa-512x512.png dist/client/
	cd dist/client/assets && gzip -k -9 -f *.js *.css
	cp -R dist ../Frey-dist/
	cp -f server.js ../Frey-dist/
	if [ -f .env.production ]; then cp -f .env.production ../Frey-dist/ ; fi
	if [ -f .env.development ]; then cp -f .env.development ../Frey-dist/ ; fi
	cp -f package.json ../Frey-dist/
	cp -f pnpm-lock.yaml ../Frey-dist/

PHONY: cleanup_prebuilts
cleanup_prebuilts:
	mkdir -p ../Frey-dist/dist/client/assets
	# clean all generated bundle files except last 30
	cd ../Frey-dist/dist/client/assets && find -name '*.js' -or -name '*.css' -or -name '*.js.gz' -or -name '*.css.gz' | tail -n +30 | xargs -I {} rm {}

dev:
	./node_modules/.bin/vite --clearScreen=false

# TODO
#.PHONY: init_test_db
#init_test_db:
#	@bin/phinx migrate -e testing

# TODO
#.PHONY: clean_test_db
#clean_test_db:
#	while read p; do \
#		PGPASSWORD=pgpass psql -hdb.pantheon.internal -U frey frey_unit -c "DROP TABLE \"$$p\""; \
#	done < ./data/tablelist.txt || true

PHONY: reload_pm2
reload_pm2:
	HOME=/home/user su-exec user pm2 restart all
	HOME=/home/user su-exec user pm2 scale server 8 || exit 0

# TODO
#.PHONY: container_init_test_db
#container_init_test_db: get_container_id
#	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
#		echo "${RED}Frey container is not running.${NC}"; \
#	else \
#		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make init_test_db' ; \
#	fi

# TODO
#.PHONY: container_clean_test_db
#container_clean_test_db: get_container_id
#	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
#		echo "${RED}Frey container is not running.${NC}"; \
#	else \
#		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make clean_test_db' ; \
#	fi

# TODO
#.PHONY: container_seed
#container_seed: get_container_id container_migrate
#	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
#		echo "${RED}Frey container is not running, can't run seeding.${NC}"; \
#	else \
#	  $(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user bin/phinx seed:run -e docker -s BasicSeeder --verbose'; \
#	fi

# TODO
#.PHONY: container_dump_users
#container_dump_users: get_container_id
#	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
#		echo "${RED}Frey container is not running.${NC}"; \
#	else \
#		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cat /tmp/frey_tokens_debug' ; \
#	fi


PHONY: proto_gen
proto_gen:
	./node_modules/.bin/twirpscript

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

PHONY: container_deps
container_deps: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make deps' ; \
	fi

PHONY: container_prod_deps
container_prod_deps: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make prod_deps' ; \
	fi

PHONY: container_autofix
container_autofix: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make autofix' ; \
	fi

PHONY: container_build
container_build: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make build' ; \
	fi

PHONY: container_cleanup_prebuilts
container_cleanup_prebuilts: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make cleanup_prebuilts' ; \
	fi

PHONY: container_prebuild
container_prebuild: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make prebuild' ; \
	fi

PHONY: container_reload_pm2
container_reload_pm2: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make reload_pm2' ; \
	fi

PHONY: container_proto_gen
container_proto_gen: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Frey container is not running.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Frey && HOME=/home/user su-exec user make proto_gen' ; \
	fi

# TODO
#PHONY: container_warmup
#container_warmup: get_container_id
#	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
#		echo "${RED}Frey container is not running.${NC}"; \
#	else \
#		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'for i in $$(seq 1 8); do curl http://sigrun.pantheon.internal > /dev/null; done' ; \
#	fi
#
