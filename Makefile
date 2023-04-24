UID := $(shell id -u $$SUDO_USER)
UID ?= $(shell id -u $$USER)

# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: deps
deps:
	@echo "Hint: you may need to run this as root on some linux distros. Try it in case of any error."
	cd Tyr && make docker_deps
	cd Mimir && make docker_deps
	cd Frey && make docker_deps
	cd Rheda && make docker_deps
	cd Forseti && make docker_deps

.PHONY: kill
kill:
	docker-compose down
	cd Tyr && make kill
	cd Mimir && make kill
	cd Frey && make kill
	cd Rheda && make kill
	cd Forseti && make kill
	docker rmi pantheon_db

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
	echo "- ${YELLOW}Rheda${NC} is accessible on port 4002 (http://localhost:4002) and is set up to use local Mimir"; \
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
	echo " ${YELLOW}Run 'make shell' in each subproject folder to get into each container shell${NC} "; \
	echo " ${YELLOW}Also you can use 'make shell_{tyr|rheda|frey|mimir|forseti}' to get ${NC} "; \
	echo " ${YELLOW}to specific subproject folder after entering container shell${NC} "; \


.PHONY: pantheon_stop
pantheon_stop:
	docker-compose down

.PHONY: run
run: pantheon_run

.PHONY: stop
stop: pantheon_stop

.PHONY: dev_tyr
dev_tyr:
	cd Tyr && make docker_dev

.PHONY: dev_forseti
dev_forseti:
	cd Forseti && make docker_dev

.PHONY: forseti_stop
forseti_stop:
	cd Forseti && make docker_stop

.PHONY: tyr_stop
tyr_stop:
	cd Tyr && make docker_stop

.PHONY: dev
dev: run
	${MAKE} deps
	${MAKE} migrate
	bash ./parallel_dev.sh

.PHONY: migrate
migrate:
	cd Mimir && make docker_migrate
	cd Frey && make docker_migrate

.PHONY: shell_tyr
shell_tyr:
	cd Tyr && make shell

.PHONY: shell_rheda
shell_rheda:
	cd Rheda && make shell

.PHONY: shell_mimir
shell_mimir:
	cd Mimir && make shell

.PHONY: shell_frey
shell_frey:
	cd Frey && make shell

.PHONY: shell_forseti
shell_forseti:
	cd Forseti && make shell

# Some shortcuts for common tasks

.PHONY: seed
seed:
	cd Frey && make docker_seed
	cd Mimir && make docker_seed

.PHONY: seed_bigevent
seed_bigevent:
	cd Frey && make docker_seed
	cd Mimir && make docker_seed_bigevent

.PHONY: seed_tournament
seed_tournament:
	cd Frey && make docker_seed
	cd Mimir && make docker_seed_tournament

.PHONY: dump_users
dump_users:
	cd Frey && make docker_dump_users

.PHONY: check
check: lint
	cd Mimir && make docker_unit
	cd Frey && make docker_unit
	cd Rheda && make docker_unit
	cd Tyr && make docker_unit

.PHONY: lint
lint:
	cd Mimir && make docker_lint
	cd Frey && make docker_lint
	cd Rheda && make docker_lint
	cd Tyr && make docker_lint
	cd Forseti && make docker_lint

.PHONY: check_covered
check_covered: lint
	cd Mimir && make docker_unit_covered
	cd Frey && make docker_unit_covered
	cd Rheda && make docker_unit_covered
	cd Tyr && make docker_unit_covered
	# TODO: fix sending coverall reports

.PHONY: autofix
autofix:
	cd Mimir && make docker_autofix
	cd Frey && make docker_autofix
	cd Rheda && make docker_autofix
	cd Tyr && make docker_autofix
	cd Forseti && make docker_autofix

.PHONY: proto_gen
proto_gen:
	cd Mimir && make docker_proto_gen
	cd Frey && make docker_proto_gen
	cd Forseti && make docker_proto_gen
	cd Tyr && make docker_proto_gen
	cd Rheda && make docker_proto_gen

# Prod related tasks & shortcuts

.PHONY: prod_deps
prod_deps:
	cd Mimir && make deps
	cd Rheda && make deps
	cd Frey && make deps

.PHONY: prod_build_tyr
prod_build_tyr: # this is for automated builds, don't run it manually
	cd Tyr && make docker_build && make docker_cleanup_prebuilts && make docker_prebuild

.PHONY: prod_build_forseti
prod_build_forseti: # this is for automated builds, don't run it manually
	cd Forseti && make docker_build && make docker_cleanup_prebuilts && make docker_prebuild

# i18n related
.PHONY: i18n_extract
i18n_extract:
	cd Rheda && make docker_i18n_extract
	cd Tyr && make docker_i18n_extract
	cd Forseti && make docker_i18n_extract

.PHONY: i18n_compile
i18n_compile: get_docker_id
	cd Rheda && make docker_i18n_compile
	cd Tyr && make docker_i18n_update
	cd Forseti && make docker_i18n_update

.PHONY: bump_release
bump_release:
	git rev-parse --short HEAD > Common/ReleaseTag.txt
	git add Common/ReleaseTag.txt
	git commit --message "Updated release tag"
