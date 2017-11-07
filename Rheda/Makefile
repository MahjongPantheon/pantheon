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
	php vendor/bin/phpcs src www --ignore=www/assets/*

dev:
	echo "Running dev server on port 8001..."
	cd www && php -S localhost:8001 -c ../config/php.dev.ini

unit:
	php bin/unit.php

check: lint unit

autofix:
	php vendor/bin/phpcbf --config-set default_standard PSR2
	php vendor/bin/phpcbf --config-set show_warnings 0
	php vendor/bin/phpcbf src www --ignore=www/assets/*

i18n_extract:
	touch i18n/messages.pot
	find ./src -iname "*.php" | xargs xgettext -j --keyword=_t --keyword=_n:1,2 --from-code=UTF-8 -o i18n/messages.pot
	find ./src -iname "*.handlebars" | xargs xgettext-template -L Handlebars --from-code=UTF-8 --keyword=_t --keyword=_n:1,2 -j -o i18n/messages.pot
	chmod a+w i18n/messages.pot
