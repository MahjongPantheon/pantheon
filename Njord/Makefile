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
	./node_modules/.bin/nodemon src/index.ts

.PHONY: build
build:
	./node_modules/.bin/tsc --project tsconfig.json

PHONY: proto_gen
proto_gen:
	./node_modules/.bin/twirpscript
