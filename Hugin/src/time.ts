import moment from 'moment';
import 'moment-timezone';

export const TIMEZONE = process.env.HUGIN_TIMEZONE ?? 'UTC';
if (!moment.tz.zone(TIMEZONE)) {
  throw new Error(`Unknown Hugin timezone: ${TIMEZONE}`);
}
export const timestamp = (value: moment.MomentInput = moment()) =>
  moment.utc(value).format('YYYY-MM-DD HH:mm:ss.SSS');
export const calendar = (value: moment.MomentInput = moment(), zone = TIMEZONE) =>
  moment(value).tz(zone);
export { moment };
