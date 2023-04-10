SQLITE_FILE ?= data/db.sqlite

hooks:
	if [ -d .git ]; then \
		cp -prf bin/hooks/* .git/hooks; \
		chmod a+x .git/hooks/*; \
	fi

deps: hooks
	php bin/composer.phar install

lint:
	php vendor/bin/phpcs --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcs --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcs --ignore=*/generated/*,src/TwirpServer.php src tests www
	php vendor/bin/phpstan clear-result-cache && php vendor/bin/phpstan analyse -c phpstan.neon

unit:
	php bin/unit.php

unit_covered: lint
	phpdbg -qrr bin/unit.php  --testdox --coverage-clover=/tmp/coverage-mimir.xml

check: lint unit

apidoc:
	php bin/routeDoc.php > APIDOC.md

autofix:
	php vendor/bin/phpcbf --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcbf --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcbf src tests www

dev:
	echo "Running dev server on port 8000..."
	cd www && php -S localhost:8000

req:
	php bin/rpc.php "$(filter-out $@,$(MAKECMDGOALS))"

init_test_db:
	echo "Initializing test db..."
	@php bin/phinx migrate -e testing

clean_test_db:
	echo "Cleaning test db..."
	while read p; do \
		PGPASSWORD=pgpass psql -h127.0.0.1 -p5532 -U mimir mimir_unit -c "DROP TABLE $$p"; \
	done < ./data/tablelist.txt || true

