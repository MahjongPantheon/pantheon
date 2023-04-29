protoc_version := 3.21.9-r0
protoc_dir := protoc-bin
protoc_bin := $(protoc_dir)/bin/protoc

uname_s := $(shell uname)
uname_m := $(shell uname -m)
pos := linux
protocarch := $(pos)-x86_64

protoc_zip_name := protoc-$(protoc_version)-$(protocarch).zip
protoc_url := https://github.com/google/protobuf/releases/download/v$(protoc_version)/$(protoc_zip_name)
protoc_zip_output := $(protoc_dir)/$(protoc_zip_name)

$(protoc_bin):
	rm -rf $(protoc_dir)
	mkdir -p $(protoc_dir)
	curl --retry 5 -L $(protoc_url) -o $(protoc_zip_output)
	unzip $(protoc_zip_output) -d $(protoc_dir)
	rm $(protoc_zip_output)
	touch $(protoc_bin) # override time from zip

# Ignore timestamp
protoc-bin: | $(protoc_bin)
