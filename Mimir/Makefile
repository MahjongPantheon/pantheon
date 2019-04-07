SQLITE_FILE ?= data/db.sqlite

hooks:
	if [ -d .git ]; then \
		cp -prf bin/hooks/* .git/hooks; \
		chmod a+x .git/hooks/*; \
	fi

deps: hooks
	php bin/composer.phar install

lint:
	php vendor/bin/phpcs --config-set default_standard PSR2
	php vendor/bin/phpcs --config-set show_warnings 0
	php vendor/bin/phpcs src tests www

unit:
	php bin/unit.php --testdox

unit_covered: lint
	phpdbg -qrr bin/unit.php  --testdox --coverage-clover=/tmp/coverage-mimir.xml

check: lint unit

apidoc:
	php bin/routeDoc.php > APIDOC.md

autofix:
	php vendor/bin/phpcbf --config-set default_standard PSR2
	php vendor/bin/phpcbf --config-set show_warnings 0
	php vendor/bin/phpcbf src tests www

dev:
	echo "Running dev server on port 8000..."
	cd www && php -S localhost:8000

req:
	php bin/rpc.php "$(filter-out $@,$(MAKECMDGOALS))"

init_test_db:
	@bin/phinx migrate -e testing

clean_test_db:
	while read p; do \
		PGPASSWORD=pgpass psql -p5532 -U mimir mimir_unit -c "DELETE FROM $$p"; \
		PGPASSWORD=pgpass psql -p5532 -U mimir mimir_unit -c "ALTER SEQUENCE IF EXISTS $${p}_id_seq RESTART"; \
	done < ./data/tablelist.txt

