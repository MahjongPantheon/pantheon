UID := $(shell id -u $$SUDO_USER)
UID ?= $(shell id -u $$USER)

# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.EXPORT_ALL_VARIABLES:

ENV_FILENAME ?= default.env

.PHONY: deps
deps:
	@echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."
	cd Tyr && ${MAKE} docker_deps
	cd Mimir && ${MAKE} docker_deps
	cd Frey && ${MAKE} docker_deps
	cd Forseti && ${MAKE} docker_deps
	cd Sigrun && ${MAKE} docker_deps

.PHONY: kill
kill:
	docker-compose down --remove-orphans
	cd Tyr && ${MAKE} kill
	cd Mimir && ${MAKE} kill
	cd Frey && ${MAKE} kill
	cd Forseti && ${MAKE} kill
	cd Sigrun && ${MAKE} kill
	cd Database && ${MAKE} kill
	docker-compose rm -v

.PHONY: container
container:
	docker-compose down
	docker-compose up --build -d

# Alias for conformity
.PHONY: start
start: run

.PHONY: pantheon_run
pantheon_run:
	docker-compose up --build -d
	echo "----------------------------------------------------------------------------------"; \
	echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."; \
	echo "- ${YELLOW}Mimir API${NC} is exposed on port 4001"; \
	echo "- ${YELLOW}Sigrun${NC} is accessible on port 4002 (http://localhost:4002) without server-side rendering"; \
	echo "- ${YELLOW}Tyr${NC} is accessible on port 4003 (http://localhost:4003) as webpack dev server."; \
	echo "- ${YELLOW}Frey${NC} is exposed on port 4004"; \
	echo "- ${YELLOW}Forseti${NC} is exposed on port 4007"; \
	echo "----------------------------------------------------------------------------------"; \
	echo "- ${YELLOW}PostgreSQL${NC} is exposed on port 5532 of local host"; \
	echo "- ${YELLOW}PgAdmin4${NC} is exposed on port 5632 (http://localhost:5632)"; \
	echo "    -> Login to PgAdmin4 as: "; \
	echo "    ->     Username: dev@riichimahjong.org "; \
	echo "    ->     Password: password "; \
	echo "    -> PgAdmin4-mimir pgsql connection credentials hint: "; \
	echo "    ->     Hostname: db "; \
	echo "    ->     Port:     5532 "; \
	echo "    ->     Username: mimir "; \
	echo "    ->     Password: pgpass "; \
	echo "    -> PgAdmin4-frey pgsql connection credentials hint: "; \
	echo "    ->     Hostname: db "; \
	echo "    ->     Port:     5532 "; \
	echo "    ->     Username: frey "; \
	echo "    ->     Password: pgpass "; \
	echo "----------------------------------------------------------------------------------"; \
	echo " ${GREEN}Run 'make logs' in each subproject folder to view container logs on-line${NC} "; \
	echo " ${GREEN}Run 'make php_logs' in each subproject folder to view container php logs on-line${NC} "; \
	echo " ${YELLOW}Run 'make shell' in each subproject folder to get into each container shell.${NC} "; \
	echo " ${YELLOW}Also you can use 'make shell_{tyr|frey|mimir|forseti|sigrun}' to get ${NC} "; \
	echo " ${YELLOW}to specific subproject folder${NC} "; \


.PHONY: pantheon_stop
pantheon_stop:
	cd Database && make stop 2>/dev/null || true # gracefully stop the db
	docker-compose down

.PHONY: run
run: pantheon_run

.PHONY: stop
stop: pantheon_stop

.PHONY: dev_tyr
dev_tyr:
	cd Tyr && ${MAKE} docker_dev

.PHONY: dev_forseti
dev_forseti:
	cd Forseti && ${MAKE} docker_dev

.PHONY: dev_sigrun
dev_sigrun:
	cd Sigrun && ${MAKE} docker_dev

.PHONY: forseti_stop
forseti_stop:
	cd Forseti && ${MAKE} docker_stop

.PHONY: tyr_stop
tyr_stop:
	cd Tyr && ${MAKE} docker_stop

.PHONY: sigrun_stop
sigrun_stop:
	cd Sigrun && ${MAKE} docker_stop

.PHONY: dev
dev: run
	${MAKE} deps
	${MAKE} migrate
	bash ./parallel_dev.sh

.PHONY: migrate
migrate:
	cd Mimir && ${MAKE} docker_migrate
	cd Frey && ${MAKE} docker_migrate

.PHONY: shell_tyr
shell_tyr:
	cd Tyr && ${MAKE} shell

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

.PHONY: shell_db
shell_db:
	cd Database && ${MAKE} shell

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

.PHONY: autofix
autofix:
	cd Mimir && ${MAKE} docker_autofix
	cd Frey && ${MAKE} docker_autofix
	cd Frey && ${MAKE} docker_autofix_common
	cd Tyr && ${MAKE} docker_autofix
	cd Forseti && ${MAKE} docker_autofix
	cd Sigrun && ${MAKE} docker_autofix

.PHONY: proto_gen
proto_gen:
	cd Mimir && ${MAKE} docker_proto_gen
	cd Frey && ${MAKE} docker_proto_gen
	cd Forseti && ${MAKE} docker_proto_gen
	cd Tyr && ${MAKE} docker_proto_gen
	cd Sigrun && ${MAKE} docker_proto_gen

# Prod related tasks & shortcuts

.PHONY: prod_deps
prod_deps:
	cd Mimir && ${MAKE} docker_deps
	cd Frey && ${MAKE} docker_deps
	cd Tyr && ${MAKE} docker_deps
	cd Forseti && ${MAKE} docker_deps
	# sigrun should install deps after prebuild

.PHONY: prod_build_tyr
prod_build_tyr: # this is for automated builds, don't run it manually
	cd Tyr && ${MAKE} docker_build && ${MAKE} docker_cleanup_prebuilts && ${MAKE} docker_prebuild

.PHONY: prod_build_forseti
prod_build_forseti: # this is for automated builds, don't run it manually
	cd Forseti && ${MAKE} docker_build && ${MAKE} docker_cleanup_prebuilts && ${MAKE} docker_prebuild

.PHONY: prod_build_sigrun
prod_build_sigrun: # this is for automated builds, don't run it manually
	cd Sigrun && ${MAKE} docker_deps && ${MAKE} docker_build && ${MAKE} docker_cleanup_prebuilts && ${MAKE} docker_prebuild && ${MAKE} docker_prod_deps

.PHONY: prod_compile
prod_compile: export NO_XDEBUG=1
prod_compile:
	@if [ "$(ENV_FILENAME)" = "" ]; then \
		echo "${RED}Please set env file name using ENV_FILENAME environment variable. The file should be placed in Common/envs folder.${NC}"; \
		exit 1; \
	fi
	docker-compose --env-file ./Common/envs/${ENV_FILENAME} up --build -d
	${MAKE} prod_deps
	${MAKE} migrate
	${MAKE} prod_build_tyr
	${MAKE} prod_build_forseti
	${MAKE} prod_build_sigrun && cd Sigrun && ${MAKE} docker_reload_pm2

.PHONY: bootstrap_admin
bootstrap_admin:
	cd Frey && ${MAKE} docker_seed

# i18n related
.PHONY: i18n_extract
i18n_extract:
	cd Tyr && ${MAKE} docker_i18n_extract
	cd Forseti && ${MAKE} docker_i18n_extract
	cd Sigrun && ${MAKE} docker_i18n_extract

.PHONY: i18n_compile
i18n_compile:
	cd Tyr && ${MAKE} docker_i18n_update
	cd Forseti && ${MAKE} docker_i18n_update
	cd Sigrun && ${MAKE} docker_i18n_update

.PHONY: bump_release
bump_release:
	git rev-parse --short HEAD > Common/ReleaseTag.txt
	git add Common/ReleaseTag.txt
	git commit --message "Updated release tag"
