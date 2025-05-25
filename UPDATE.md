# Updating Pantheon

Updating infrastructure between major versions takes some effort, because sometimes newer versions are incompatible with older ones. In general, the process is the following:

- Ensure no games are in progress now.
- Stop your reverse proxy (e.g. `sudo systemctl stop nginx` on your host system)
- Go to pantheon folder (all further actions are performed from there)
- Export pantheon database with `make db_export`. It will produce `export.tar.gz` file in `Database` folder. Copy it somewhere just in case.
- Stop all containers with `make prod_stop_all`.
- Ensure all the pantheon containers are stopped with `docker ps`, if there are something left, you need to stop them manually with `docker stop CONTAINER_ID`.
- (optional, will free some disk space) Inspect and remove the stopped containers and their images:
  - Use `docker ps -a` to view all the containers including stopped ones
  - Use `docker images` to view all the images
  - Use `docker rm CONTAINER_ID` to remove the container
  - Use `docker rmi IMAGE_ID` to remove the image
- Checkout newer version of the code with `git fetch && git checkout origin/master`.
- Pull newer version of the containers with `make pull`.
- Start the containers with `make prod_start`. 
  - Note that newer version of the code uses different database storage volume. This allows a safer rollback if required (but in the same time it requires doing export/import of the data).
- Import your saved data with `make db_import`. It will use the `export.tar.gz` file saved in `Database` folder, it should be still there (unless you cleaned something). If it's not, copy it there from where you saved it last time before running import. Import might output some errors, the ones related to deleting tables can be ignored safely.
- Run `make prod_compile` to update the frontend code.
- Restart your reverse proxy (e.g. `sudo systemctl start nginx` on your host system).

After all the steps completed, check if everything works as expected.

Replace `docker` with `podman` in the instruction above if you're using podman.

## When do I need to use this instruction?

❗ If your current revision is older or equal to the following ones, the update to last master will require the process described above:
- https://github.com/MahjongPantheon/pantheon/commit/f27a8bca1afaa9e33b6368d74d5b66100bf9ea33 
