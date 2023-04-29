include protoc.mk

proto_gen:
	mkdir -p generated
	protoc --twirp_php_out=generated/ --php_out=generated/ proto/frey.proto proto/mimir.proto proto/atoms.proto
