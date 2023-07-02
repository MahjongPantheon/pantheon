# some coloring
RED = $(shell echo -e '\033[1;31m')
GREEN = $(shell echo -e '\033[1;32m')
YELLOW = $(shell echo -e '\033[1;33m')
NC = $(shell echo -e '\033[0m') # No Color

.PHONY: get_docker_id
get_docker_id:
	$(eval RUNNING_DOCKER_ID := $(shell docker ps | grep 'pantheon' | grep 'hermod' | awk '{print $$1}'))

.PHONY: shell
shell: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Hermod container is not running, can't get to shell.${NC}"; \
	else \
		docker exec -it $(RUNNING_DOCKER_ID) sh -c 'cd /var/www/html/Hermod && /bin/sh' ; \
	fi

.PHONY: kill
kill:
	docker rmi `docker images | grep 'pantheon' | grep 'hermod' | awk '{print $$3}'` || exit 0

.PHONY: docker_last_mail
docker_last_mail: get_docker_id
	@if [ "$(RUNNING_DOCKER_ID)" = "" ]; then \
		echo "${RED}Hermod container is not running, can't run seeding.${NC}"; \
	else \
		docker exec -t $(RUNNING_DOCKER_ID) sh -c 'php81 /var/www/html/Hermod/prettify_email.php'; \
	fi
