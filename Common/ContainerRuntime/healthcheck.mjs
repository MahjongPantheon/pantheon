import { existsSync } from 'node:fs';
import { createConnection } from 'node:net';
import { pathToFileURL } from 'node:url';
import { startupStatus } from './startup-status.mjs';

const range = (start, count) => Array.from({ length: count }, (_, index) => start + index);
export const servicePorts = {
  Tyr: [80],
  Forseti: [80],
  Frey: [80, ...range(41041, 8)],
  Mimir: [80, ...range(41011, 6)],
  Hugin: [80, ...range(41081, 4)],
  Gullveig: [80, 41091],
  Meili: [80, ...range(41121, 4)],
  Hermod: [80, 41071],
  Skirnir: [80, 41151],
  Sigrun: [80, ...range(41021, 6)],
  Bragi: [80, ...range(41081, 6)],
};

export const developmentPorts = {
  Tyr: 4003,
  Forseti: 4007,
  Frey: 4004,
  Mimir: 4001,
  Hugin: 4008,
  Gullveig: 4009,
  Meili: 4012,
  Hermod: 4007,
  Skirnir: 4015,
  Sigrun: 4002,
  Bragi: 4008,
};

export function listening(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: 'localhost', port, autoSelectFamily: true });
    const finish = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.setTimeout(1500, () => finish(false));
  });
}

export async function healthy(
  service,
  { readyPath = '/run/pantheon-ready', probe = listening, supervisor } = {}
) {
  if (startupStatus(service, { readyPath, supervisor }) !== 'ready' || !servicePorts[service]) {
    return false;
  }
  const ports =
    process.env.PANTHEON_DEV_WATCH === 'true'
      ? [80, developmentPorts[service]]
      : servicePorts[service];
  return (await Promise.all(ports.map(probe))).every(Boolean);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!(await healthy(process.argv[2]))) {
    console.error(
      existsSync('/run/pantheon-startup-failed')
        ? 'Dependency installation or migrations failed; inspect container logs.'
        : existsSync('/run/pantheon-ready')
          ? 'Supervisor programs or application listeners are not ready; inspect container logs and supervisorctl status.'
          : 'Dependency installation or migrations are still in progress.'
    );
    process.exitCode = 1;
  }
}
