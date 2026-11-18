import { Middleware } from 'twirpscript';
import { Context } from '../context';
import { IncomingMessage } from 'http';
import { env } from '../helpers/env';
import { createMetricsExporter } from '../../../Common/metricsExporter';

export function metrics(): Middleware<Context, IncomingMessage> {
  const exporter = createMetricsExporter();
  return async (req, ctx, next) => {
    const time = performance.now();
    const result = await next();
    const duration = performance.now() - time;
    exporter.record(env.huginUrl + '/addMetric', {
      m: 'method_exec_duration_' + req.url?.replace('/v2/common.Frey/', ''),
      v: duration,
      s: 'frey',
    });
    return result;
  };
}
