<?php
/*  Hugin: system statistics
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
namespace Hugin;

use Prometheus\CollectorRegistry;
use Prometheus\RenderTextFormat;
use Prometheus\Storage\Redis;

require_once __DIR__ . '/../Controller.php';

class MetricsController extends Controller
{
    const METRIC_NAME_KEY = 'm';
    const METRIC_VALUE_KEY = 'v';
    const METRIC_SOURCE_KEY = 's';

    /**
     * @return string
     * @throws \Throwable
     */
    public function getMetrics(): string
    {
        $renderer = new RenderTextFormat();
        $result = $renderer->render($this->_getRegistry()->getMetricFamilySamples());
        header('Content-type: ' . RenderTextFormat::MIME_TYPE);
        return $result;
    }

    /**
     * @param string $input
     * @return string
     */
    public function updateMetric(string $input)
    {
        $data = json_decode($input, true);
        $registry = $this->_getRegistry();
        foreach ($data as $item) {
            $gauge = $registry->getOrRegisterGauge('pantheon', $item[self::METRIC_NAME_KEY], '', [$item[self::METRIC_SOURCE_KEY]]);
            $gauge->set($item[self::METRIC_VALUE_KEY]);
        }

        return 'ok';
    }

    private function _getRegistry(): CollectorRegistry
    {
        Redis::setDefaultOptions(['host' => $_SERVER['REDIS_HOST'] ?? '127.0.0.1']);
        $adapter = new Redis();
        return new CollectorRegistry($adapter);
    }
}
