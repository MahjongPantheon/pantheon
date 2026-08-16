lint:
	echo "======= Common: lint (protolint) ======"
	./protolint ./proto

autofix:
	./protolint -fix ./proto

prod_deps:
	cd tsclients && rm -rf node_modules && pnpm install
