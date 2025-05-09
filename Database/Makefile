# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon-database' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Database container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd / && /bin/sh -l' ; \
	fi

,PHONY: stop
stop: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Database container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres pg_ctl -D /var/lib/postgresql/data stop' ; \
	fi

.PHONY: kill
kill:
	docker rmi `docker images | grep 'pantheon' | grep 'database' | awk '{print $$3}'` || exit 0

.PHONY: db_export
db_export: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Database container is not running, can't export db.${NC}"; \
	else \
    docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres mkdir -p /var/lib/postgresql/export' ; \
    docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres pg_dump --clean -Z0 -Fd frey -f /var/lib/postgresql/export/frey' ; \
    docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres pg_dump --clean -Z0 -Fd mimir -f /var/lib/postgresql/export/mimir'; \
    docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/lib/postgresql && su-exec postgres tar czf export.tar.gz export'; \
    docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres rm -rf /var/lib/postgresql/export'; \
    docker cp $(RUNNING_DOCKER_ID):/var/lib/postgresql/export.tar.gz ./export.tar.gz ; \
    docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres rm -rf /var/lib/postgresql/export.tar.gz'; \
  fi

.PHONY: db_import
db_import: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
    echo "${RED}Database container is not running, can't import db.${NC}"; \
	else \
    docker cp ./export.tar.gz $(RUNNING_DOCKER_ID):/var/lib/postgresql/export.tar.gz ; \
    docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres mkdir -p /var/lib/postgresql/export' ; \
    docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/lib/postgresql && su-exec postgres tar xf export.tar.gz'; \
    docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres pg_restore -d frey --clean /var/lib/postgresql/export/frey' ; \
    docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres pg_restore -d mimir --clean /var/lib/postgresql/export/mimir'; \
    docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres rm -rf /var/lib/postgresql/export /var/lib/postgresql/export.tar.gz'; \
  fi

.PHONY: __restore
__restore:
	if [ "$(COMMIT)" != "" ]; then \
		cd /var/lib/postgresql/backup && \
		git checkout ${COMMIT} && \
		cp -R mimir ../mimir-restore && \
		cp -R frey ../frey-restore && \
		git checkout main && \
		pg_restore -d frey --clean /var/lib/postgresql/frey-restore && \
		pg_restore -d mimir --clean /var/lib/postgresql/mimir-restore && \
		rm -rf /var/lib/postgresql/mimir-restore /var/lib/postgresql/frey-restore ; \
	fi

.PHONY: backup_dump_pubkey
backup_dump_pubkey: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Database container is not running, can't get pubkey.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cat /var/lib/postgresql/.ssh/id_rsa.pub' ; \
	fi

.PHONY: backup_show_history
backup_show_history: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Database container is not running, can't get history.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres sh -c "cd /var/lib/postgresql/backup && git log --oneline | less"' ; \
	fi

.PHONY: backup_restore
backup_restore: get_docker_id
	if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Database container is not running, can't rollback.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'su-exec postgres sh -c "export COMMIT=${COMMIT} && cd /var/lib/postgresql/ && make __restore"' ; \
	fi
