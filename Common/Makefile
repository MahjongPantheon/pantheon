include protoc.mk

proto_gen:
	mkdir -p generated
	protoc --twirp_php_out=generated/ --php_out=generated/ proto/hugin.proto proto/frey.proto proto/mimir.proto proto/atoms.proto

lint:
	./protolint ./proto

autofix:
	./protolint -fix ./proto
