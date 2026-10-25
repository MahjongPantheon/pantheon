import pino, { type DestinationStream } from 'pino';

export function createLogger(
  destination: DestinationStream = pino.destination('/var/log/frey.log')
) {
  return pino(destination);
}
