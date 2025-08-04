.EXPORT_ALL_VARIABLES:

UID := $(shell id -u $$SUDO_USER)
UID ?= $(shell id -u $$USER)

PODMAN_COMPOSE_PROVIDER := podman-compose
PODMAN_COMPOSE_WARNING_LOGS := false
CONTAINER_ARCH := $(shell bash bin/get_arch.sh)

CONTAINER_COMMAND := $(shell if [ -f "`which docker`" ]; \
  then echo 'docker'; \
  else echo 'podman'; \
fi)
COMPOSE_COMMAND := $(shell if [ -f "`which docker`" ]; \
  then echo 'docker compose -f docker-compose-${CONTAINER_ARCH}.yml'; \
  else echo 'podman-compose --no-ansi --podman-run-args="--replace" -f docker-compose-${CONTAINER_ARCH}.yml'; \
fi)

# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: deps
deps:
	@echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."
	cd Tyr && ${MAKE} container_deps
	cd Mimir && ${MAKE} container_deps
	cd Frey && ${MAKE} container_deps
	cd Forseti && ${MAKE} container_deps
	cd Bragi && ${MAKE} container_deps
	cd Sigrun && ${MAKE} container_deps
	cd Hugin && ${MAKE} container_deps
	cd Gullveig && ${MAKE} container_deps
	cd Skirnir && ${MAKE} container_deps
	cd Fenrir && ${MAKE} container_deps

.PHONY: kill_dev
kill_dev: export ENV_FILENAME=.env.development
kill_dev:
	${MAKE} kill

.PHONY: kill
kill:
	@printf "${RED}This will completely remove ALL data and ALL saved internal configuration.${NC}" ; \
  printf "\n" ; \
  printf "Are you sure you want to continue? (y/N)" ; \
	read answer ; \
	if [ "$$answer" = "Y" ] || [ "$$answer" = "y" ]  ; then \
		${COMPOSE_COMMAND} down --remove-orphans ; \
		cd Fenrir && ${MAKE} kill ; \
		cd ../Tyr && ${MAKE} kill ; \
		cd ../Mimir && ${MAKE} kill ; \
		cd ../Frey && ${MAKE} kill ; \
		cd ../Forseti && ${MAKE} kill ; \
		cd ../Sigrun && ${MAKE} kill ; \
		cd ../Bragi && ${MAKE} kill ; \
		cd ../Hugin && ${MAKE} kill ; \
		cd ../Skirnir && ${MAKE} kill ; \
		cd ../Database && ${MAKE} kill ; \
		${CONTAINER_COMMAND} volume rm `${CONTAINER_COMMAND} volume ls | grep 'pantheon' | grep 'datavolume02' | awk '{print $$2}'` ; \
		${CONTAINER_COMMAND} volume rm `${CONTAINER_COMMAND} volume ls | grep 'pantheon' | grep 'backupvolume01' | awk '{print $$2}'` ; \
		${CONTAINER_COMMAND} volume rm `${CONTAINER_COMMAND} volume ls | grep 'pantheon' | grep 'configvolume01' | awk '{print $$2}'` ; \
		${CONTAINER_COMMAND} volume rm `${CONTAINER_COMMAND} volume ls | grep 'pantheon' | grep 'gullveigstorage01' | awk '{print $$2}'` ; \
		${CONTAINER_COMMAND} volume rm `${CONTAINER_COMMAND} volume ls | grep 'pantheon' | grep 'grafanastorage01' | awk '{print $$2}'` ; \
	fi

.PHONY: build_reverse_proxy
build_reverse_proxy: export COMPOSE_DOCKER_CLI_BUILD=1
build_reverse_proxy: export DOCKER_BUILDKIT=1
build_reverse_proxy:
	cd Common/ReverseProxy && ${CONTAINER_COMMAND} buildx build -t pantheon-reverse-proxy .

.PHONY: container
container: export COMPOSE_DOCKER_CLI_BUILD=1
container: export DOCKER_BUILDKIT=1
container:
	cd Common/Backend && ${CONTAINER_COMMAND} buildx build -t ghcr.io/mahjongpantheon/pantheon-backend-common-v3:latest .
	cd Common/Frontend && ${CONTAINER_COMMAND} buildx build -t ghcr.io/mahjongpantheon/pantheon-frontend-common-v3:latest .
	${COMPOSE_COMMAND} down
	${COMPOSE_COMMAND} up --build -d

.PHONY: container_dev
container_dev: export ENV_FILENAME=.env.development
container_dev: build_reverse_proxy
container_dev:
	${MAKE} container

.PHONY: reverse_proxy_start
reverse_proxy_start:
	@if [ -z "`netstat -tunl | grep ':80 '`" ]; then \
		cd Common/ReverseProxy && \
    	${CONTAINER_COMMAND} run \
    	    -p 80:80 \
    	    --network=pantheon_internal_net \
    	    --name pantheon-reverse-proxy-container \
    	    -d pantheon-reverse-proxy ; \
	fi

.PHONY: reverse_proxy_stop
reverse_proxy_stop:
	@${CONTAINER_COMMAND} stop pantheon-reverse-proxy-container || true
	@${CONTAINER_COMMAND} rm pantheon-reverse-proxy-container || true

.PHONY: pantheon_run
pantheon_run: export ENV_FILENAME=.env.development
pantheon_run:
	@cp Env/.env.development Tyr/.env.development
	@cp Env/.env.development Sigrun/.env.development
	@cp Env/.env.development Bragi/.env.development
	@cp Env/.env.development Forseti/.env.development
	@cp Env/.env.development Skirnir/.env.development
	@if [ -f Env/.env.development.local ]; then \
  	cat Env/.env.development.local >> Tyr/.env.development && \
  	cat Env/.env.development.local >> Sigrun/.env.development && \
  	cat Env/.env.development.local >> Bragi/.env.development && \
  	cat Env/.env.development.local >> Forseti/.env.development && \
  	cat Env/.env.development.local >> Skirnir/.env.development ; \
	fi
	@${COMPOSE_COMMAND} up -d
	@echo "----------------------------------------------------------------------------------"; \
	echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."; \
	echo "----------------------------------------------------------------------------------"; \
	echo "Please see README.md for addresses of services and further instructions." ;

.PHONY: pantheon_stop
pantheon_stop: reverse_proxy_stop
pantheon_stop: export ENV_FILENAME=.env.development
pantheon_stop:
	cd Database && make stop 2>/dev/null || true # gracefully stop the db
	${COMPOSE_COMMAND} down

.PHONY: enable_debug
enable_debug: export ENV_FILENAME=.env.development
enable_debug:
	@cd Mimir && ${MAKE} container_enable_debug
	@cd Hugin && ${MAKE} container_enable_debug
	@cd Gullveig && ${MAKE} container_enable_debug

.PHONY: disable_debug
disable_debug: export ENV_FILENAME=.env.development
disable_debug:
	@cd Mimir && ${MAKE} container_disable_debug
	@cd Hugin && ${MAKE} container_disable_debug
	@cd Gullveig && ${MAKE} container_disable_debug


.PHONY: dev_tyr
dev_tyr:
	cd Tyr && ${MAKE} container_dev

.PHONY: dev_forseti
dev_forseti:
	cd Forseti && ${MAKE} container_dev

.PHONY: dev_sigrun
dev_sigrun:
	cd Sigrun && ${MAKE} container_dev

.PHONY: dev_bragi
dev_bragi:
	cd Bragi && ${MAKE} container_dev

.PHONY: dev_frey
dev_frey:
	cd Frey && ${MAKE} container_dev

.PHONY: dev_skirnir
dev_skirnir:
	cd Skirnir && ${MAKE} container_dev

.PHONY: forseti_stop
forseti_stop:
	cd Forseti && ${MAKE} container_stop

.PHONY: tyr_stop
tyr_stop:
	cd Tyr && ${MAKE} container_stop

.PHONY: sigrun_stop
sigrun_stop:
	cd Sigrun && ${MAKE} container_stop

.PHONY: bragi_stop
bragi_stop:
	cd Bragi && ${MAKE} container_stop

.PHONY: skirnir_stop
skirnir_stop:
	cd Skirnir && ${MAKE} container_stop

.PHONY: frey_stop
frey_stop:
	cd Frey && ${MAKE} container_stop

.PHONY: dev
dev: build_reverse_proxy pantheon_run
	${MAKE} reverse_proxy_stop
	${MAKE} reverse_proxy_start
	${MAKE} deps
	${MAKE} migrate
	bash ./parallel_dev.sh

.PHONY: migrate
migrate:
	cd Mimir && ${MAKE} container_migrate
	cd Frey && ${MAKE} container_migrate
	cd Hugin && ${MAKE} container_migrate

.PHONY: migrate_frey1
migrate_frey1:
	cd Frey && ${MAKE} container_migrate_frey1

.PHONY: shell_tyr
shell_tyr:
	cd Tyr && ${MAKE} shell

.PHONY: shell_hermod
shell_hermod:
	cd Hermod && ${MAKE} shell

.PHONY: shell_hugin
shell_hugin:
	cd Hugin && ${MAKE} shell

.PHONY: shell_mimir
shell_mimir:
	cd Mimir && ${MAKE} shell

.PHONY: shell_frey
shell_frey:
	cd Frey && ${MAKE} shell

.PHONY: shell_forseti
shell_forseti:
	cd Forseti && ${MAKE} shell

.PHONY: shell_sigrun
shell_sigrun:
	cd Sigrun && ${MAKE} shell

.PHONY: shell_bragi
shell_bragi:
	cd Bragi && ${MAKE} shell

.PHONY: shell_db
shell_db:
	cd Database && ${MAKE} shell

.PHONY: shell_gullveig
shell_gullveig:
	cd Gullveig && ${MAKE} shell

.PHONY: shell_skirnir
shell_skirnir:
	cd Skirnir && ${MAKE} shell

.PHONY: shell_fenrir
shell_fenrir:
	cd Fenrir && ${MAKE} shell

# Some shortcuts for common tasks

.PHONY: seed
seed:
	${MAKE} bootstrap_admin
	cd Mimir && ${MAKE} container_seed

.PHONY: seed_bigevent
seed_bigevent:
	${MAKE} bootstrap_admin
	cd Mimir && ${MAKE} container_seed_bigevent

.PHONY: seed_tournament
seed_tournament:
	${MAKE} bootstrap_admin
	cd Mimir && ${MAKE} container_seed_tournament

.PHONY: dump_last_mail
dump_last_mail:
	cd Hermod && ${MAKE} container_last_mail

.PHONY: bragi_eslint
bragi_eslint:
	cd Bragi && ${MAKE} container_eslint > ../tmp/bragi_eslint.log 2>&1

.PHONY: bragi_prettier
bragi_prettier:
	cd Bragi && ${MAKE} container_prettier > ../tmp/bragi_prettier.log 2>&1

.PHONY: bragi_typecheck
bragi_typecheck:
	cd Bragi && ${MAKE} container_typecheck > ../tmp/bragi_typecheck.log 2>&1

.PHONY: forseti_eslint
forseti_eslint:
	cd Forseti && ${MAKE} container_eslint > ../tmp/forseti_eslint.log 2>&1

.PHONY: forseti_prettier
forseti_prettier:
	cd Forseti && ${MAKE} container_prettier > ../tmp/forseti_prettier.log 2>&1

.PHONY: forseti_typecheck
forseti_typecheck:
	cd Forseti && ${MAKE} container_typecheck > ../tmp/forseti_typecheck.log 2>&1

.PHONY: frey_eslint
frey_eslint:
	cd Frey && ${MAKE} container_eslint > ../tmp/frey_lint.log 2>&1

.PHONY: frey_prettier
frey_prettier:
	cd Frey && ${MAKE} container_prettier > ../tmp/frey_prettier.log 2>&1

.PHONY: frey_typecheck
frey_typecheck:
	cd Frey && ${MAKE} container_typecheck > ../tmp/frey_typecheck.log 2>&1

.PHONY: gullveig_lint
gullveig_lint:
	cd Gullveig && ${MAKE} container_lint > ../tmp/gullveig_lint.log 2>&1

.PHONY: gullveig_analyze
gullveig_analyze:
	cd Gullveig && ${MAKE} container_analyze > ../tmp/gullveig_analyze.log 2>&1

.PHONY: hugin_lint
hugin_lint:
	cd Hugin && ${MAKE} container_lint > ../tmp/hugin_lint.log 2>&1

.PHONY: hugin_analyze
hugin_analyze:
	cd Hugin && ${MAKE} container_analyze > ../tmp/hugin_analyze.log 2>&1

.PHONY: mimir_lint
mimir_lint:
	cd Mimir && ${MAKE} container_lint > ../tmp/mimir_lint.log 2>&1

.PHONY: mimir_analyze
mimir_analyze:
	cd Mimir && ${MAKE} container_analyze > ../tmp/mimir_analyze.log 2>&1

.PHONY: skirnir_eslint
skirnir_eslint:
	cd Skirnir && ${MAKE} container_eslint > ../tmp/skirnir_eslint.log 2>&1

.PHONY: skirnir_prettier
skirnir_prettier:
	cd Skirnir && ${MAKE} container_prettier > ../tmp/skirnir_prettier.log 2>&1

.PHONY: skirnir_typecheck
skirnir_typecheck:
	cd Skirnir && ${MAKE} container_typecheck > ../tmp/skirnir_typecheck.log 2>&1

.PHONY: sigrun_eslint
sigrun_eslint:
	cd Sigrun && ${MAKE} container_eslint > ../tmp/sigrun_eslint.log 2>&1

.PHONY: sigrun_prettier
sigrun_prettier:
	cd Sigrun && ${MAKE} container_prettier > ../tmp/sigrun_prettier.log 2>&1

.PHONY: sigrun_typecheck
sigrun_typecheck:
	cd Sigrun && ${MAKE} container_typecheck > ../tmp/sigrun_typecheck.log 2>&1

.PHONY: tyr_eslint
tyr_eslint:
	cd Tyr && ${MAKE} container_eslint > ../tmp/tyr_eslint.log 2>&1

.PHONY: tyr_prettier
tyr_prettier:
	cd Tyr && ${MAKE} container_prettier > ../tmp/tyr_prettier.log 2>&1

.PHONY: tyr_typecheck
tyr_typecheck:
	cd Tyr && ${MAKE} container_typecheck > ../tmp/tyr_typecheck.log 2>&1

.PHONY: fenrir_eslint
fenrir_eslint:
	cd Fenrir && ${MAKE} container_eslint > ../tmp/fenrir_eslint.log 2>&1

.PHONY: fenrir_prettier
fenrir_prettier:
	cd Fenrir && ${MAKE} container_prettier > ../tmp/fenrir_prettier.log 2>&1

.PHONY: fenrir_typecheck
fenrir_typecheck:
	cd Fenrir && ${MAKE} container_typecheck > ../tmp/fenrir_typecheck.log 2>&1

.PHONY: lint
lint:
	${MAKE} -j16 bragi_eslint bragi_prettier bragi_typecheck \
		forseti_eslint forseti_prettier forseti_typecheck \
		frey_eslint frey_prettier frey_typecheck \
		gullveig_lint gullveig_analyze \
		hugin_lint hugin_analyze \
		mimir_lint mimir_analyze \
		skirnir_eslint skirnir_prettier skirnir_typecheck \
		sigrun_eslint sigrun_prettier sigrun_typecheck \
		tyr_eslint tyr_prettier tyr_typecheck \
		fenrir_eslint fenrir_prettier fenrir_typecheck || { \
			LINT_RESULT=$$? ;\
			cat tmp/* ;\
			exit $$LINT_RESULT ;\
		}

.PHONY: test
test:
	@echo "Running tests for all subsystems"
	@echo "For more information, you might also want to run 'make test_verbose'"
	cd Tyr && ${MAKE} container_test
	cd Frey && ${MAKE} container_test
	cd Mimir && ${MAKE} container_test

.PHONY: test_verbose
test_verbose:
	cd Tyr && ${MAKE} container_test_verbose
	cd Frey && ${MAKE} container_test_verbose
	cd Mimir && ${MAKE} container_test_verbose

.PHONY: autofix
autofix:
	cd Mimir && ${MAKE} container_autofix
	cd Frey && ${MAKE} container_autofix
	cd Tyr && ${MAKE} container_autofix
	cd Forseti && ${MAKE} container_autofix
	cd Sigrun && ${MAKE} container_autofix
	cd Hugin && ${MAKE} container_autofix
	cd Gullveig && ${MAKE} container_autofix
	cd Bragi && ${MAKE} container_autofix
	cd Skirnir && ${MAKE} container_autofix
	cd Fenrir && ${MAKE} container_autofix

# First updates php generated code, second updates generated typescript
.PHONY: proto_gen
proto_gen:
	cd Mimir && ${MAKE} container_proto_gen
	cd Frey && ${MAKE} container_proto_gen
	${MAKE} deps

# Db import/export

.PHONY: db_export
db_export:
	cd Database && ${MAKE} db_export

.PHONY: db_import
db_import:
	cd Database && ${MAKE} db_import

# Prod related tasks & shortcuts

.PHONY: prod_deps
prod_deps:
	cd Mimir && ${MAKE} container_deps
	cd Frey && ${MAKE} container_deps
	cd Tyr && ${MAKE} container_deps
	cd Forseti && ${MAKE} container_deps
	cd Hugin && ${MAKE} container_deps
	cd Gullveig && ${MAKE} container_deps
	# sigrun, skirnir and bragi should install deps after prebuild

.PHONY: prod_build_tyr
prod_build_tyr: export NODE_ENV=production
prod_build_tyr: # this is for automated builds, don't run it manually
	cd Tyr && ${MAKE} container_build && ${MAKE} container_cleanup_prebuilts && ${MAKE} container_prebuild

.PHONY: prod_build_forseti
prod_build_forseti: export NODE_ENV=production
prod_build_forseti: # this is for automated builds, don't run it manually
	cd Forseti && ${MAKE} container_build && ${MAKE} container_cleanup_prebuilts && ${MAKE} container_prebuild

.PHONY: prod_build_sigrun
prod_build_sigrun: export NODE_ENV=production
prod_build_sigrun: # this is for automated builds, don't run it manually
	cd Sigrun && ${MAKE} container_deps && ${MAKE} container_build && ${MAKE} container_cleanup_prebuilts && ${MAKE} container_prebuild && ${MAKE} container_prod_deps

.PHONY: prod_build_frey
prod_build_frey: export NODE_ENV=production
prod_build_frey: # this is for automated builds, don't run it manually
	cd Frey && ${MAKE} container_deps && ${MAKE} container_build && ${MAKE} container_prebuild && ${MAKE} container_prod_deps

.PHONY: prod_build_bragi
prod_build_bragi: export NODE_ENV=production
prod_build_bragi: # this is for automated builds, don't run it manually
	cd Bragi && ${MAKE} container_deps && ${MAKE} container_build && ${MAKE} container_cleanup_prebuilts && ${MAKE} container_prebuild && ${MAKE} container_prod_deps

.PHONY: prod_build_skirnir
prod_build_skirnir: export NODE_ENV=production
prod_build_skirnir: # this is for automated builds, don't run it manually
	cd Skirnir && ${MAKE} container_deps && ${MAKE} container_build && ${MAKE} container_prebuild && ${MAKE} container_prod_deps && ${MAKE} container_reload_pm2

.PHONY: prod_compile
prod_compile: export ENV_FILENAME=.env.production
prod_compile:
	@cp Env/.env.production Tyr/.env.production
	@cp Env/.env.production Sigrun/.env.production
	@cp Env/.env.production Forseti/.env.production
	@cp Env/.env.production Bragi/.env.production
	@cp Env/.env.production Skirnir/.env.production
	@cp Env/.env.production Frey/.env.production
	${MAKE} prod_deps
	${MAKE} migrate
	${MAKE} prod_build_tyr
	${MAKE} prod_build_forseti
	${MAKE} prod_build_frey && cd Frey && ${MAKE} container_reload_pm2
	${MAKE} prod_build_sigrun && cd Sigrun && ${MAKE} container_reload_pm2
	cd Sigrun && ${MAKE} container_warmup
	${MAKE} prod_build_bragi && cd Bragi && ${MAKE} container_reload_pm2
	cd Bragi && ${MAKE} container_warmup
	${MAKE} prod_build_skirnir && cd Skirnir && ${MAKE} container_reload_pm2

.PHONY: prod_start
prod_start: export ENV_FILENAME=.env.production
prod_start:
	ALLOWED_SENDER_DOMAINS=`cat Env/.env.production | grep ALLOWED_SENDER_DOMAINS= | awk -F'=' '{print $$2}'` ${COMPOSE_COMMAND} up -d

.PHONY: prod_stop_all
prod_stop_all: export ENV_FILENAME=.env.production
prod_stop_all:
	cd Database && make stop 2>/dev/null || true # gracefully stop the db
	@${COMPOSE_COMMAND} down

.PHONY: prod_stop
prod_stop: export ENV_FILENAME=.env.production
prod_stop:
	@${COMPOSE_COMMAND} down forseti.pantheon.internal frey.pantheon.internal hermod.pantheon.internal \
    hugin.pantheon.internal mimir.pantheon.internal sigrun.pantheon.internal tyr.pantheon.internal \
    gullveig.pantheon.internal bragi.pantheon.internal skirnir.pantheon.internal

.PHONY: prod_restart
prod_restart:
	${MAKE} prod_stop
	${MAKE} prod_start

.PHONY: prod_update
prod_update:
	git status --short | grep -v 'Sigrun-dist/server.js' | awk '{print $2}' | xargs git checkout --
	git fetch
	git checkout origin/master
	${MAKE} pull
	${MAKE} prod_restart
	${MAKE} prod_compile

.PHONY: pull
pull:
	@${COMPOSE_COMMAND} pull

.PHONY: bootstrap_admin
bootstrap_admin:
	cd Frey && ${MAKE} container_bootstrap_admin

# i18n related
.PHONY: i18n_extract
i18n_extract:
	cd Tyr && ${MAKE} container_i18n_extract
	cd Forseti && ${MAKE} container_i18n_extract
	cd Sigrun && ${MAKE} container_i18n_extract
	cd Bragi && ${MAKE} container_i18n_extract

.PHONY: i18n_compile
i18n_compile:
	cd Tyr && ${MAKE} container_i18n_update
	cd Forseti && ${MAKE} container_i18n_update
	cd Sigrun && ${MAKE} container_i18n_update
	cd Bragi && ${MAKE} container_i18n_update

.PHONY: bump_release
bump_release:
	git rev-parse --short HEAD > Common/ReleaseTag.txt
	git add Common/ReleaseTag.txt
	git commit --message "Updated release tag"

.PHONY: e2e
e2e: export ENV_FILENAME=.env.e2e
e2e:
	cd Fenrir && ${MAKE} container_run

.PHONY: e2e_local
e2e_dev: export ENV_FILENAME=.env.e2e
e2e_dev:
	${CONTAINER_COMMAND} pull ghcr.io/mahjongpantheon/pantheon-fenrir-${CONTAINER_ARCH}:latest
	@${COMPOSE_COMMAND} --profile e2e up -d
	${MAKE} e2e_compile
	cd Fenrir && ${MAKE} container_deps && ${MAKE} container_run

.PHONY: e2e_build_tyr
e2e_build_tyr: export NODE_ENV=development
e2e_build_tyr: export ENV_FILENAME=.env.e2e
e2e_build_tyr: # this is for automated builds, don't run it manually
	cd Tyr && ${MAKE} container_build && ${MAKE} container_cleanup_prebuilts && ${MAKE} container_prebuild

.PHONY: e2e_build_forseti
e2e_build_forseti: export NODE_ENV=development
e2e_build_forseti: export ENV_FILENAME=.env.e2e
e2e_build_forseti: # this is for automated builds, don't run it manually
	cd Forseti && ${MAKE} container_build && ${MAKE} container_cleanup_prebuilts && ${MAKE} container_prebuild

.PHONY: e2e_build_sigrun
e2e_build_sigrun: export NODE_ENV=development
e2e_build_sigrun: export ENV_FILENAME=.env.e2e
e2e_build_sigrun: # this is for automated builds, don't run it manually
	cd Sigrun && ${MAKE} container_deps && ${MAKE} container_build && ${MAKE} container_cleanup_prebuilts && ${MAKE} container_prebuild && ${MAKE} container_prod_deps

.PHONY: e2e_build_frey
e2e_build_frey: export NODE_ENV=development
e2e_build_frey: export ENV_FILENAME=.env.e2e
e2e_build_frey: # this is for automated builds, don't run it manually
	cd Frey && ${MAKE} container_deps && ${MAKE} container_build && ${MAKE} container_prebuild && ${MAKE} container_prod_deps

.PHONY: e2e_build_bragi
e2e_build_bragi: export NODE_ENV=development
e2e_build_bragi: export ENV_FILENAME=.env.e2e
e2e_build_bragi: # this is for automated builds, don't run it manually
	cd Bragi && ${MAKE} container_deps && ${MAKE} container_build && ${MAKE} container_cleanup_prebuilts && ${MAKE} container_prebuild && ${MAKE} container_prod_deps

.PHONY: e2e_build_skirnir
e2e_build_skirnir: export NODE_ENV=development
e2e_build_skirnir: export ENV_FILENAME=.env.e2e
e2e_build_skirnir: # this is for automated builds, don't run it manually
	cd Skirnir && ${MAKE} container_deps && ${MAKE} container_build && ${MAKE} container_prebuild && ${MAKE} container_prod_deps

.PHONY: e2e_compile
e2e_compile: export ENV_FILENAME=.env.e2e
e2e_compile:
	@cp Env/.env.e2e Tyr/.env.e2e
	@cp Env/.env.e2e Sigrun/.env.e2e
	@cp Env/.env.e2e Forseti/.env.e2e
	@cp Env/.env.e2e Bragi/.env.e2e
	@cp Env/.env.e2e Skirnir/.env.e2e
	@cp Env/.env.e2e Frey/.env.e2e
	${MAKE} deps
	${MAKE} migrate
	${MAKE} e2e_build_tyr
	${MAKE} e2e_build_forseti
	${MAKE} e2e_build_sigrun && cd Sigrun && ${MAKE} container_reload_pm2
	${MAKE} e2e_build_frey && cd Frey && ${MAKE} container_reload_pm2
	${MAKE} e2e_build_bragi && cd Bragi && ${MAKE} container_reload_pm2
	${MAKE} e2e_build_skirnir && cd Skirnir && ${MAKE} container_reload_pm2

.PHONY: e2e_run
e2e_run: export ENV_FILENAME=.env.e2e
e2e_run:
	${CONTAINER_COMMAND} pull ghcr.io/mahjongpantheon/pantheon-fenrir-${CONTAINER_ARCH}:latest
	@${COMPOSE_COMMAND} --profile e2e up -d
