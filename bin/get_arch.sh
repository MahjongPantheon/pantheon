#!/bin/bash

if [ ! -z "$CONTAINER_ARCH_OVERRIDE" ]; then
  echo "Overriding containers arch to $CONTAINER_ARCH_OVERRIDE" > /dev/stderr;
  echo $CONTAINER_ARCH_OVERRIDE;
else
  case "`uname -m`" in
    x86_64)
      echo "amd64";
      ;;
    amd64)
      echo "amd64";
      ;;
    *)
      echo "arm64";
      ;;
  esac;
fi
