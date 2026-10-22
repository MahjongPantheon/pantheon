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
	$(eval RUNNING_CONTAINER_ID := $(shell $(CONTAINER_COMMAND) ps | grep 'pantheon' | grep 'gullveig' | awk '{print $$1}'))

.PHONY: shell
shell: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running, can't get to shell.${NC}"; \
	else \
		$(CONTAINER_COMMAND) exec -it $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && /bin/sh -l' ; \
	fi

.PHONY: logs
logs: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running, can't view logs.${NC}"; \
	else \
		$(CONTAINER_COMMAND) logs -f $(RUNNING_CONTAINER_ID); \
	fi

.PHONY: deps
deps:
	pnpm install --frozen-lockfile

.PHONY: dev_deps
dev_deps:
	pnpm install --no-frozen-lockfile

.PHONY: container_deps
container_deps: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make deps' ; \
	fi

.PHONY: container_dev_deps
container_dev_deps: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make dev_deps' ; \
	fi

.PHONY: oxlint
oxlint:
	echo "======= Gullveig: oxlint ======"
	pnpm exec oxlint .

.PHONY: container_oxlint
container_oxlint: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make oxlint' ; \
	fi

.PHONY: oxfmt
oxfmt:
	echo "======= Gullveig: oxfmt ======"
	pnpm exec oxfmt --check

.PHONY: container_oxfmt
container_oxfmt: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make oxfmt' ; \
	fi

.PHONY: typecheck
typecheck:
	echo "======= Gullveig: typecheck ======"
	pnpm exec tsc --project tsconfig.json --noEmit

.PHONY: container_typecheck
container_typecheck: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make typecheck' ; \
	fi

.PHONY: autofix
autofix:
	pnpm exec oxlint . --fix
	pnpm exec oxfmt

.PHONY: container_autofix
container_autofix: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make autofix' ; \
	fi

.PHONY: dev
dev:
	pnpm exec tsx watch --inspect=0.0.0.0:4209/debug src/server.ts

.PHONY: container_dev
container_dev: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make dev' ; \
	fi

.PHONY: reload
reload:
	supervisorctl restart gullveig

.PHONY: container_reload
container_reload: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make reload' ; \
	fi

.PHONY: container_reload_nginx
container_reload_nginx: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "Gullveig container is not running, cannot reload Nginx."; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec $(RUNNING_CONTAINER_ID) sh -c 'cp /var/www/html/Gullveig/gullveig-container.nginx.conf /etc/nginx/http.d/gullveig.conf && nginx -t && nginx -s reload'; \
	fi

.PHONY: build
build:
	mkdir -p dist
	pnpm exec tsx build.ts

.PHONY: container_build
container_build: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make build' ; \
	fi

.PHONY: prod_deps
prod_deps:
	cd ../Gullveig-dist && rm -rf node_modules && NODE_ENV=production pnpm install --prod --frozen-lockfile

.PHONY: container_prod_deps
container_prod_deps: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make prod_deps' ; \
	fi

.PHONY: prebuild
prebuild:
	mkdir -p ../Gullveig-dist
	cp -f dist/server.js ../Gullveig-dist/
	cp -f package.json ../Gullveig-dist/
	cp -f pnpm-lock.yaml ../Gullveig-dist/

.PHONY: container_prebuild
container_prebuild: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make prebuild' ; \
	fi

.PHONY: kill
kill:
	$(CONTAINER_COMMAND) rmi `$(CONTAINER_COMMAND) images | grep 'pantheon' | grep 'gullveig' | awk '{print $$3}'` || exit 0

.PHONY: container_stop
container_stop: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "${RED}Gullveig container is not running.${NC}"; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'killall node' ; \
	fi

.PHONY: test test_verbose container_test container_test_verbose
test:
	pnpm test --runInBand

test_verbose:
	pnpm test --runInBand --verbose

container_test container_test_verbose: get_container_id
	@if [ "$(RUNNING_CONTAINER_ID)" = "" ]; then \
		echo "Gullveig container is not running."; exit 1; \
	else \
		$(CONTAINER_COMMAND) exec -t $(RUNNING_CONTAINER_ID) sh -c 'cd /var/www/html/Gullveig && HOME=/home/user su-exec user make $(patsubst container_%,%,$@)'; \
	fi
