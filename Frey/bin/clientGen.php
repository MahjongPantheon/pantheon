<?php
/*  Frey: ACL & user data storage
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
namespace Frey;
require_once __DIR__ . '/../../bin/genCommon.php';

if (empty($argv[1])) {
    trigger_error('Wrong subsystem argument' . PHP_EOL . 'Usage: php bin/clientGen.php Mimir [interface]' . PHP_EOL, E_USER_ERROR);
    die();
}

if (!empty($argv[2]) && $argv[2] == 'interface') {
    genInterface(getData(__DIR__, 'Frey'), $argv[1]);
} else {
    genClient(getData(__DIR__, 'Frey'), $argv[1]);
}

function genInterface($doc, $packageName) {
    ?><?php echo '<?php' . PHP_EOL; ?>

namespace <?php echo $packageName; ?>;

/**
* Interface IFreyClient
* THIS IS A GENERATED FILE! DO NOT MODIFY BY HAND, USE bin/clientGen.php
*
* @package <?php echo $packageName; ?>
*/
interface IFreyClient
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
require_once __DIR__ . '/interfaces/IFreyClient.php'; // TODO: replace with custom frey client interface path

/**
 * Class FreyClient
 * THIS IS A GENERATED FILE! DO NOT MODIFY BY HAND, USE bin/clientGen.php
 *
 * @package <?php echo $packageName; ?>
 */
class FreyClient implements IFreyClient
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
