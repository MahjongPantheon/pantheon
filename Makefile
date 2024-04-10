UID := $(shell id -u $$SUDO_USER)
UID ?= $(shell id -u $$USER)

COMPOSE_COMMAND := $(shell if [ -f "`which podman-compose`" ]; then echo 'podman-compose'; else echo 'docker compose'; fi)

# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.EXPORT_ALL_VARIABLES:

.PHONY: deps
deps:
	@echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."
	cd Tyr && ${MAKE} docker_deps
	cd Mimir && ${MAKE} docker_deps
	cd Frey && ${MAKE} docker_deps
	cd Forseti && ${MAKE} docker_deps
	cd Bragi && ${MAKE} docker_deps
	cd Sigrun && ${MAKE} docker_deps
	cd Hugin && ${MAKE} docker_deps
	cd Gullveig && ${MAKE} docker_deps
	cd Skirnir && ${MAKE} docker_deps
	cd Fenrir && ${MAKE} docker_deps

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
		docker volume rm `docker volume ls | grep 'pantheon' | grep 'datavolume01' | awk '{print $$2}'` ; \
		docker volume rm `docker volume ls | grep 'pantheon' | grep 'backupvolume01' | awk '{print $$2}'` ; \
		docker volume rm `docker volume ls | grep 'pantheon' | grep 'configvolume01' | awk '{print $$2}'` ; \
	fi

.PHONY: container
container:
	cd Common/ReverseProxy && docker build -t pantheon-reverse-proxy .
	${COMPOSE_COMMAND} down
	${COMPOSE_COMMAND} up --build -d

.PHONY: container_dev
container_dev: export ENV_FILENAME=.env.development
container_dev:
	${MAKE} container

.PHONY: reverse_proxy_start
reverse_proxy_start:
	@if [ -z "`netstat -tunl | grep ':80 '`" ]; then \
		cd Common/ReverseProxy && \
    	docker run \
    	    -p 80:80 \
    	    --network=pantheon_internal_net \
    	    --name pantheon-reverse-proxy-container \
    	    -d pantheon-reverse-proxy ; \
	fi

.PHONY: reverse_proxy_stop
reverse_proxy_stop:
	@docker stop pantheon-reverse-proxy-container || true
	@docker rm pantheon-reverse-proxy-container || true

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
	@cd Mimir && ${MAKE} docker_enable_debug
	@cd Frey && ${MAKE} docker_enable_debug
	@cd Hugin && ${MAKE} docker_enable_debug
	@cd Gullveig && ${MAKE} docker_enable_debug
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

.PHONY: dev_tyr
dev_tyr:
	cd Tyr && ${MAKE} docker_dev

.PHONY: dev_forseti
dev_forseti:
	cd Forseti && ${MAKE} docker_dev

.PHONY: dev_sigrun
dev_sigrun:
	cd Sigrun && ${MAKE} docker_dev

.PHONY: dev_bragi
dev_bragi:
	cd Bragi && ${MAKE} docker_dev

.PHONY: dev_skirnir
dev_skirnir:
	cd Skirnir && ${MAKE} docker_dev

.PHONY: forseti_stop
forseti_stop:
	cd Forseti && ${MAKE} docker_stop

.PHONY: tyr_stop
tyr_stop:
	cd Tyr && ${MAKE} docker_stop

.PHONY: sigrun_stop
sigrun_stop:
	cd Sigrun && ${MAKE} docker_stop

.PHONY: bragi_stop
bragi_stop:
	cd Bragi && ${MAKE} docker_stop

.PHONY: skirnir_stop
skirnir_stop:
	cd Skirnir && ${MAKE} docker_stop

.PHONY: dev
dev: pantheon_run
	${MAKE} reverse_proxy_stop
	${MAKE} reverse_proxy_start
	${MAKE} deps
	${MAKE} migrate
	bash ./parallel_dev.sh

.PHONY: migrate
migrate:
	cd Mimir && ${MAKE} docker_migrate
	cd Frey && ${MAKE} docker_migrate
	cd Hugin && ${MAKE} docker_migrate

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
	cd Frey && ${MAKE} docker_seed
	cd Mimir && ${MAKE} docker_seed

.PHONY: seed_bigevent
seed_bigevent:
	cd Frey && ${MAKE} docker_seed
	cd Mimir && ${MAKE} docker_seed_bigevent

.PHONY: seed_tournament
seed_tournament:
	cd Frey && ${MAKE} docker_seed
	cd Mimir && ${MAKE} docker_seed_tournament

.PHONY: dump_users
dump_users:
	cd Frey && ${MAKE} docker_dump_users

.PHONY: dump_last_mail
dump_last_mail:
	cd Hermod && ${MAKE} docker_last_mail

.PHONY: check
check:
	cd Mimir && ${MAKE} docker_check
	cd Frey && ${MAKE} docker_check
	cd Frey && ${MAKE} docker_check_common
	cd Tyr && ${MAKE} docker_lint
	cd Tyr && ${MAKE} docker_unit
	cd Forseti && ${MAKE} docker_lint
	cd Sigrun && ${MAKE} docker_lint
	cd Hugin && ${MAKE} docker_check
	cd Gullveig && ${MAKE} docker_check
	cd Bragi && ${MAKE} docker_lint
	cd Skirnir && ${MAKE} docker_lint
	cd Fenrir && ${MAKE} docker_lint

.PHONY: autofix
autofix:
	cd Mimir && ${MAKE} docker_autofix
	cd Frey && ${MAKE} docker_autofix
	cd Frey && ${MAKE} docker_autofix_common
	cd Tyr && ${MAKE} docker_autofix
	cd Forseti && ${MAKE} docker_autofix
	cd Sigrun && ${MAKE} docker_autofix
	cd Hugin && ${MAKE} docker_autofix
	cd Gullveig && ${MAKE} docker_autofix
	cd Bragi && ${MAKE} docker_autofix
	cd Skirnir && ${MAKE} docker_autofix
	cd Fenrir && ${MAKE} docker_autofix

.PHONY: proto_gen
proto_gen:
	cd Mimir && ${MAKE} docker_proto_gen
	cd Frey && ${MAKE} docker_proto_gen
	cd Forseti && ${MAKE} docker_proto_gen
	cd Tyr && ${MAKE} docker_proto_gen
	cd Sigrun && ${MAKE} docker_proto_gen
	cd Hugin && ${MAKE} docker_proto_gen

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
	cd Mimir && ${MAKE} docker_deps
	cd Frey && ${MAKE} docker_deps
	cd Tyr && ${MAKE} docker_deps
	cd Forseti && ${MAKE} docker_deps
	cd Hugin && ${MAKE} docker_deps
	cd Gullveig && ${MAKE} docker_deps
	# sigrun, skirnir and bragi should install deps after prebuild

.PHONY: prod_build_basic_images
prod_build_basic_images:
	docker build -t docker.io/ctizen/pantheon_backend_common ./Common/Backend
	docker build -t docker.io/ctizen/pantheon_frontend_common ./Common/Frontend

.PHONY: prod_build_tyr
prod_build_tyr: export NODE_ENV=production
prod_build_tyr: # this is for automated builds, don't run it manually
	cd Tyr && ${MAKE} docker_build && ${MAKE} docker_cleanup_prebuilts && ${MAKE} docker_prebuild

.PHONY: prod_build_forseti
prod_build_forseti: export NODE_ENV=production
prod_build_forseti: # this is for automated builds, don't run it manually
	cd Forseti && ${MAKE} docker_build && ${MAKE} docker_cleanup_prebuilts && ${MAKE} docker_prebuild

.PHONY: prod_build_sigrun
prod_build_sigrun: export NODE_ENV=production
prod_build_sigrun: # this is for automated builds, don't run it manually
	cd Sigrun && ${MAKE} docker_deps && ${MAKE} docker_build && ${MAKE} docker_cleanup_prebuilts && ${MAKE} docker_prebuild && ${MAKE} docker_prod_deps

.PHONY: prod_build_bragi
prod_build_bragi: export NODE_ENV=production
prod_build_bragi: # this is for automated builds, don't run it manually
	cd Bragi && ${MAKE} docker_deps && ${MAKE} docker_build && ${MAKE} docker_cleanup_prebuilts && ${MAKE} docker_prebuild && ${MAKE} docker_prod_deps

.PHONY: prod_build_skirnir
prod_build_skirnir: export NODE_ENV=production
prod_build_skirnir: # this is for automated builds, don't run it manually
	cd Skirnir && ${MAKE} docker_deps && ${MAKE} docker_build && ${MAKE} docker_prebuild && ${MAKE} docker_prod_deps && ${MAKE} docker_reload_pm2

.PHONY: prod_compile
prod_compile: export ENV_FILENAME=.env.production
prod_compile:
	@cp Env/.env.production Tyr/.env.production
	@cp Env/.env.production Sigrun/.env.production
	@cp Env/.env.production Forseti/.env.production
	@cp Env/.env.production Bragi/.env.production
	@cp Env/.env.production Skirnir/.env.production
	${MAKE} prod_deps
	${MAKE} migrate
	${MAKE} prod_build_tyr
	${MAKE} prod_build_forseti
	${MAKE} prod_build_sigrun && cd Sigrun && ${MAKE} docker_reload_pm2
	cd Sigrun && ${MAKE} docker_warmup
	${MAKE} prod_build_bragi && cd Bragi && ${MAKE} docker_reload_pm2
	cd Bragi && ${MAKE} docker_warmup
	${MAKE} prod_build_skirnir && cd Skirnir && ${MAKE} docker_reload_pm2

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
	@${COMPOSE_COMMAND} down forseti frey hermod hugin mimir sigrun tyr gullveig bragi skirnir

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
	cd Frey && ${MAKE} docker_seed

# i18n related
.PHONY: i18n_extract
i18n_extract:
	cd Tyr && ${MAKE} docker_i18n_extract
	cd Forseti && ${MAKE} docker_i18n_extract
	cd Sigrun && ${MAKE} docker_i18n_extract
	cd Bragi && ${MAKE} docker_i18n_extract

.PHONY: i18n_compile
i18n_compile:
	cd Tyr && ${MAKE} docker_i18n_update
	cd Forseti && ${MAKE} docker_i18n_update
	cd Sigrun && ${MAKE} docker_i18n_update
	cd Bragi && ${MAKE} docker_i18n_update

.PHONY: bump_release
bump_release:
	git rev-parse --short HEAD > Common/ReleaseTag.txt
	git add Common/ReleaseTag.txt
	git commit --message "Updated release tag"

.PHONY: e2e
e2e: export ENV_FILENAME=.env.e2e
e2e:
	@${COMPOSE_COMMAND} up fenrir -d
	cd Fenrir && ${MAKE} docker_run

.PHONY: e2e_build_tyr
e2e_build_tyr: export NODE_ENV=development
e2e_build_tyr: export ENV_FILENAME=.env.e2e
e2e_build_tyr: # this is for automated builds, don't run it manually
	cd Tyr && ${MAKE} docker_build && ${MAKE} docker_cleanup_prebuilts && ${MAKE} docker_prebuild

.PHONY: e2e_build_forseti
e2e_build_forseti: export NODE_ENV=development
e2e_build_forseti: export ENV_FILENAME=.env.e2e
e2e_build_forseti: # this is for automated builds, don't run it manually
	cd Forseti && ${MAKE} docker_build && ${MAKE} docker_cleanup_prebuilts && ${MAKE} docker_prebuild

.PHONY: e2e_build_sigrun
e2e_build_sigrun: export NODE_ENV=development
e2e_build_sigrun: export ENV_FILENAME=.env.e2e
e2e_build_sigrun: # this is for automated builds, don't run it manually
	cd Sigrun && ${MAKE} docker_deps && ${MAKE} docker_build && ${MAKE} docker_cleanup_prebuilts && ${MAKE} docker_prebuild && ${MAKE} docker_prod_deps

.PHONY: e2e_build_bragi
e2e_build_bragi: export NODE_ENV=development
e2e_build_bragi: export ENV_FILENAME=.env.e2e
e2e_build_bragi: # this is for automated builds, don't run it manually
	cd Bragi && ${MAKE} docker_deps && ${MAKE} docker_build && ${MAKE} docker_cleanup_prebuilts && ${MAKE} docker_prebuild && ${MAKE} docker_prod_deps

.PHONY: e2e_build_skirnir
e2e_build_skirnir: export NODE_ENV=development
e2e_build_skirnir: export ENV_FILENAME=.env.e2e
e2e_build_skirnir: # this is for automated builds, don't run it manually
	cd Skirnir && ${MAKE} docker_deps && ${MAKE} docker_build && ${MAKE} docker_prebuild && ${MAKE} docker_prod_deps && ${MAKE} docker_reload_pm2

.PHONY: e2e_compile
e2e_compile: export ENV_FILENAME=.env.e2e
e2e_compile:
	@cp Env/.env.e2e Tyr/.env.e2e
	@cp Env/.env.e2e Sigrun/.env.e2e
	@cp Env/.env.e2e Forseti/.env.e2e
	@cp Env/.env.e2e Bragi/.env.e2e
	@cp Env/.env.e2e Skirnir/.env.e2e
	${MAKE} deps
	${MAKE} migrate
	${MAKE} e2e_build_tyr
	${MAKE} e2e_build_forseti
	${MAKE} e2e_build_sigrun && cd Sigrun && ${MAKE} docker_reload_pm2
	${MAKE} e2e_build_bragi && cd Bragi && ${MAKE} docker_reload_pm2
	${MAKE} e2e_build_skirnir && cd Skirnir && ${MAKE} docker_reload_pm2

.PHONY: e2e_run
e2e_run: export ENV_FILENAME=.env.e2e
e2e_run:
	@${COMPOSE_COMMAND} up -d
	@${COMPOSE_COMMAND} up fenrir -d
