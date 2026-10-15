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

## Upgrading to Frey v2

If you were using Frey v1 (any release before Aug 1 2025), you will need to do an upgrade to use newer version of the service.

Follow these steps:
- You may want to disable the services for a while, as the upgrade can't be done without downtime. It'd be best to just
  turn off your reverse proxy server (e.g. nginx) as you will need running containers to perform the upgrade. Make
  sure no games are played when you do an upgrade, you may look at monitoring service to verify it.
- Checkout to recent master using `git checkout origin/master` or update the code the way you do it usually.
- Pull new containers using `make pull`.
- Run `make prod_restart` to restart containers.
- Run `cd Database && make create_frey2_db` to create the new database for the new service.
- Run `make prod_compile` to build all the services.
- Run `make migrate_frey1` to migrate the database contents. Note that old `frey` database will not
  be altered during migration, and the new `frey2` database will be populated with the data from `frey` database. In case of
  any error you may try running the migration again, as it's executed inside the transaction which is rolled back in case of
  any error. Also if something goes wrong you might want to roll back to some previous commit and everything will work as expected.
  - Note: you should not run this command twice or run it an already populated database.
- After these steps are completed, turn the reverse proxy back on.
- Basically this is it, congratulations :) Now you may want to remove `frey` database, though we'd advise to not doing this
  for a while, until you verify that everything works find.

## Upgrading to Mimir v2

If you were using Mimir v1 (any release before Sep 1 2025), you will need to do an upgrade to use newer version of the service.

Follow these steps:
- You may want to disable the services for a while, as the upgrade can't be done without downtime. It'd be best to just
  turn off your reverse proxy server (e.g. nginx) as you will need running containers to perform the upgrade. Make
  sure no games are played when you do an upgrade, you may look at monitoring service to verify it.
- Checkout to recent master using `git checkout origin/master` or update the code the way you do it usually.
- Pull new containers using `make pull`.
- Run `make prod_restart` to restart containers.
- Run `cd Database && make create_mimir2_db` to create the new database for the new service.
- Run `make prod_compile` to build all the services.
- Run `make migrate_mimir1` to migrate the database contents. Note that old `mimir` database will not
  be altered during migration, and the new `mimir2` database will be populated with the data from `mimir` database. In case of
  any error you may try running the migration again, as it's executed inside the transaction which is rolled back in case of
  any error. Also if something goes wrong you might want to roll back to some previous commit and everything will work as expected.
  - Note: you should not run this command twice or run it an already populated database.
- After these steps are completed, turn the reverse proxy back on.
- Basically this is it, congratulations :) Now you may want to remove `mimir` database, though we'd advise to not doing this
  for a while, until you verify that everything works find.

Note that all the actions to upgrade to Frey v2 and Mimir v2 can be done in parallel.
