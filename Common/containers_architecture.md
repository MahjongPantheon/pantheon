## Containers architecture

### Common terms

- Containers are run using either docker or podman.
- Exposed ports of containers should match description in Pantheon_Service_Ports.md in knowledge base.
- Containers use following volumes with following purpose:
  - datavolume02: persistent database storage volume
  - backupvolume01: persistent backups storage volume
  - configvolume01: database container ssh configuration for backups
  - gullveigstorage01: persistent avatars storage
  - grafanastorage01: grafana auxiliary volume
  - pfspool01 and pfetc01: postfix storage configuration volumes for Hermod
  - prometheusdata: monitoring data volume
  - services_modules: shared production volume containing the pnpm cache in `store/` and isolated main/dist node_modules trees in `modules/<project>/`; mounted at `/.pnpm` with each node_modules tree also mounted through its volume subpath
- Containers use shared network named `internal_net` with bridge driver. Subnet to be used is `192.168.34.0/24` with gateway on `192.168.34.1`. Shared network can be attached to new containers without restart.
