import { Middleware } from 'twirpscript';
import { Context } from '../context.js';
import { IncomingMessage } from 'http';
import { createMetricsExporter } from '../../../Common/metricsExporter.js';

export function metrics(): Middleware<Context, IncomingMessage> {
  const exporter = createMetricsExporter();
  return async (req, ctx, next) => {
    const time = performance.now();
    try {
      const result = await next();
      const duration = performance.now() - time;
      exporter.record(ctx.repository.config.huginUrl + '/addMetric', {
        m: 'method_exec_duration_' + req.url?.replace('/v2/common.Mimir/', ''),
        v: duration,
        s: 'mimir',
      });
      return result;
    } catch (e: any) {
      ctx.repository.log.error(
        e,
        'Request errored',
        req.url?.replace('/v2/common.Mimir/', '') ?? 'Unknown'
      );
      throw e;
    }
  };
}
