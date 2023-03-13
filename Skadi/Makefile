PHONY: deps
deps:
	if [ -e "`which yarn`" ]; then yarn; else npm install; fi

PHONY: lint
lint:
	make -k -j4 typecheck eslint prettier

PHONY: eslint
eslint:
	./node_modules/.bin/eslint . --ext .js,.ts,.tsx

PHONY: prettier
prettier:
	./node_modules/.bin/prettier -c ./app

PHONY: typecheck
typecheck:
	./node_modules/.bin/tsc --project tsconfig.json --noEmit

PHONY: autofix
autofix:
	./node_modules/.bin/eslint . --ext .js,.ts,.tsx --fix
	./node_modules/.bin/prettier -w ./app

.PHONY: dev
dev:
	rm -rf dist
	./node_modules/.bin/webpack-dev-server --config webpack.dev.js

PHONY: build
build:
	NODE_ENV=production ./node_modules/.bin/webpack --config webpack.prod.js

PHONY: proto_gen
proto_gen:
	./node_modules/.bin/twirpscript
