<?php
namespace Mimir;

// To be run once an hour
define('LOWER_LIMIT_TS', time() - 60 * 60);

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Db.php';

if (!empty(getenv('OVERRIDE_CONFIG_PATH'))) {
    $configPath = getenv('OVERRIDE_CONFIG_PATH');
} else {
    $configPath = __DIR__ . '/../config/index.php';
}
$config = new Config($configPath);
$db = new Db($config);

$now = date('d-m-Y H:i:s');

$counts = $db->table('session')->rawQuery(<<<QUERY
select count(*) as cnt, status from session
left join round on (round.session_id = session.id)
left join round as round_tmp on (round_tmp.session_id = session.id AND round_tmp.end_date > round.end_date)
where round_tmp.id IS NULL
and round.end_date BETWEEN now() - interval '2 hour' AND now() - interval '1 hour'
group by status
QUERY)->findArray();

$rounds = $db->table('round')->rawQuery(<<<QUERY
select count(*) as cnt, outcome, session.event_id, representational_hash from round
left join session on session.id = round.session_id
where round.end_date BETWEEN now() - interval '2 hour' AND now() - interval '1 hour'
group by outcome, session.event_id, representational_hash
QUERY)->findArray();

