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
	php bin/unit.php

check: lint unit

apidoc:
	php bin/routeDoc.php > APIDOC.md

autofix:
	php vendor/bin/phpcbf --config-set default_standard PSR2
	php vendor/bin/phpcbf --config-set show_warnings 0
	php vendor/bin/phpcbf src tests www

req:
	php bin/rpc.php "$(filter-out $@,$(MAKECMDGOALS))"

init_test_db:
	@bin/phinx migrate -e testing

clean_test_db:
	while read p; do \
		PGPASSWORD=pgpass psql -p5532 -U frey frey_unit -c "DELETE FROM \"$$p\""; \
		PGPASSWORD=pgpass psql -p5532 -U frey frey_unit -c "ALTER SEQUENCE IF EXISTS $${p}_id_seq RESTART"; \
	done < ./data/tablelist.txt

i18n_extract:
	touch i18n/messages.pot
	find ./src -iname "*.php" | xargs xgettext -j --no-location --keyword=_t --keyword=_n:1,2 --keyword=_p --keyword=_np:1,2 --from-code=UTF-8 -o i18n/messages.pot
	chmod a+w i18n/messages.pot
