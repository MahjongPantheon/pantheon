<?php
/*  Mimir: mahjong games storage
 *  Copyright (C) 2016  o.klimenko aka ctizen
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
namespace Mimir;
require_once __DIR__ . '/../../bin/genCommon.php';

// To prevent errors on jsonrpc loading when requiring controllers
require_once __DIR__ . '/../vendor/fguillot/json-rpc/src/JsonRPC/Client.php';
require_once __DIR__ . '/../vendor/fguillot/json-rpc/src/JsonRPC/HttpClient.php';

if (empty($argv[1])) {
    trigger_error('Wrong subsystem argument' . PHP_EOL . 'Usage: php bin/clientGen.php Rheda [interface]' . PHP_EOL, E_USER_ERROR);
    die();
}

if (!empty($argv[2]) && $argv[2] == 'interface') {
    genInterface(getData(__DIR__, 'Mimir'), $argv[1]);
} else {
    genClient(getData(__DIR__, 'Mimir'), $argv[1]);
}

function genInterface($doc, $packageName) {
    ?><?php echo '<?php' . PHP_EOL; ?>

namespace <?php echo $packageName; ?>;

/**
* Interface IMimirClient
* THIS IS A GENERATED FILE! DO NOT MODIFY BY HAND, USE bin/clientGen.php
*
* @package <?php echo $packageName; ?>
*/
interface IMimirClient
{
    public function __construct(string $apiUrl);

    /**
    * @return \JsonRPC\Client
    */
    public function getClient();
    <?php echo makeInterfaceDefinition($doc); ?>
}
<?php
}

function genClient($doc, $packageName) {
?><?php echo '<?php' . PHP_EOL; ?>

namespace <?php echo $packageName; ?>;

require_once __DIR__ . '/HttpClient.php'; // TODO: replace with custom jsonrpc httpclient implementation path
require_once __DIR__ . '/interfaces/IMimirClient.php'; // TODO: replace with custom mimir client interface path

/**
 * Class MimirClient
 * THIS IS A GENERATED FILE! DO NOT MODIFY BY HAND, USE bin/clientGen.php
 *
 * @package <?php echo $packageName; ?>
 */
class MimirClient implements IMimirClient
{
    /**
    * @var \JsonRPC\Client
    */
    protected $_client;

    public function __construct(string $apiUrl)
    {
        $this->_client = new \JsonRPC\Client($apiUrl, false, new HttpClient($apiUrl));
    }

    /**
     * @return \JsonRPC\Client
     */
    public function getClient()
    {
        return $this->_client;
    }
    <?php echo makeClientDefinition($doc); ?>
}
<?php
}
