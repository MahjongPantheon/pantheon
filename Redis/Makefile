# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon-redis' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Redis container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd / && /bin/sh -l' ; \
	fi

.PHONY: kill
kill:
	docker rmi `docker images | grep 'pantheon' | grep 'redis' | awk '{print $$3}'` || exit 0
