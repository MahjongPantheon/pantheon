## Yggdrasil: docker-based Pantheon development environment

### Preparations

Yggdrasil works on *nix hosts (mac, linux, *bsd). Windows-based systems are not supported (while it still MAY work,
it is not tested at all, also you may want to try using it under WSL in Windows 10+). 

Make sure you have Docker installed and daemon running on your system. Also Yggdrasil expects PHP5+ to be 
installed on your host system for some minor needs.

Next you should clone Yggdrasil repo with all of its submodules:
`git clone --recursive git@github.com:MahjongPantheon/Yggdrasil.git`

Note that if you're external collaborator of Pantheon project, you will need to fork & clone each submodule repo,
and then edit `.gitmodules` file to match your new repos. Pull requests should be sent for every affected submodule.  

### Running containers

Note: on some linux distros almost every docker-related command should be run as root.

1. `make container` to build a pantheon container (this should be done every time Dockerfile is changed).
2. `make run` to run the container and do all preparations inside of it (this should be done after each container shutdown).
3. `make dev` to install dependencies for all projects, run database migrations and start all servers.

To create new empty event, run `make empty_event` - and you will be able to access event with printed link. Admin
password for every generated empty event is `password`.
To create an event and fill it with some data, run `make seed` (with `sudo` if required). Note: this command will
perform a full cleanup of data!

Tyr interface is available at http://localhost:4003/ - there you can enter pin code and set up a game. 