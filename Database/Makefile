# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon' | grep 'db' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Database container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'export PS1="|$(RED)Database container$(NC) ~> $$PS1" && cd / && /bin/sh' ; \
	fi

.PHONY: kill
kill:
	docker container rm `docker container ls --all | grep 'pantheon' | grep 'db' | awk '{print $$1}'`
	docker rmi `docker images | grep 'pantheon' | grep 'db' | awk '{print $$1}'`
	docker volume rm `docker volume ls | grep 'pantheon' | grep 'datavolume01' | awk '{print $$2}'`
