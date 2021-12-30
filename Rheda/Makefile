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
	php vendor/bin/phpcs src www --ignore=www/assets/*
	php vendor/bin/phpstan clear-result-cache && php vendor/bin/phpstan analyse -c phpstan.neon

dev:
	echo "Running dev server on port 8001..."
	cd www && php -S localhost:8001 -c ../config/php.dev.ini

unit: # TODO
	# php bin/unit.php --testdox

unit_covered: # TODO
	# phpdbg -qrr bin/unit.php --testdox --coverage-clover=/tmp/coverage-rheda.xml

freygen:
	php ../Frey/bin/clientGen.php Rheda > src/FreyClient.php
	php ../Frey/bin/clientGen.php Rheda interface > src/interfaces/IFreyClient.php

mimirgen:
	php ../Mimir/bin/clientGen.php Rheda > src/MimirClient.php
	php ../Mimir/bin/clientGen.php Rheda interface > src/interfaces/IMimirClient.php

autofix:
	php vendor/bin/phpcbf --config-set default_standard PSR2 > /dev/null
	php vendor/bin/phpcbf --config-set show_warnings 0 > /dev/null
	php vendor/bin/phpcbf src www --ignore=www/assets/*

i18n_extract:
	rm ./i18n/messages.pot
	touch ./i18n/messages.pot
	find ./src -iname "*.handlebars" -print0 | sort -z | xargs -r0 xgettext-template -L Handlebars --no-location=1 --from-code=UTF-8 --keyword=_t --keyword=_n:1,2 --keyword=_p --keyword=_np:1,2 -j -o i18n/messages.pot
	find ./src -iname "*.php" -print0 | sort -z | xargs -r0 xgettext -j --no-location --keyword=_t --keyword=_n:1,2 --keyword=_p --keyword=_np:1,2 --from-code=UTF-8 -o i18n/messages.pot
	find ../Common -iname "*.php" -print0 | sort -z | xargs -r0 xgettext -j --no-location --keyword=_t --keyword=_n:1,2 --keyword=_p --keyword=_np:1,2 --from-code=UTF-8 -o i18n/messages.pot
	chmod a+w i18n/messages.pot
	msgmerge -s -U ./i18n/de_DE.UTF-8/LC_MESSAGES/messages.po ./i18n/messages.pot --backup=none
	msgmerge -s -U ./i18n/ru_RU.UTF-8/LC_MESSAGES/messages.po ./i18n/messages.pot --backup=none

i18n_compile:
	msgfmt ./i18n/de_DE.UTF-8/LC_MESSAGES/messages.po -o ./i18n/de_DE.UTF-8/LC_MESSAGES/messages.mo
	msgfmt ./i18n/ru_RU.UTF-8/LC_MESSAGES/messages.po -o ./i18n/ru_RU.UTF-8/LC_MESSAGES/messages.mo
