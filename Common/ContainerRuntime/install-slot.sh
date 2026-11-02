#!/bin/sh
# Sourced by dependency installers. The shared store limits memory-heavy pnpm
# processes across containers; flock releases the slot even after a crash.
wait_install_slot() {
  while :; do
    for install_slot in 1 2; do
      exec 9>"$1/install-$install_slot.lock"
      if flock -n 9; then return; fi
      exec 9>&-
    done
    sleep 1
  done
}
