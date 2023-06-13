<?php
namespace Hugin;

abstract class Model
{
    /**
     * @var IDb
     */
    protected $_db;

    /**
     * @var Config
     */
    protected $_config;

    /**
     * @var array
     */
    protected $_currentAccess = [];

    /**
     * Model constructor.
     * @param IDb $db
     * @param Config $config
     * @throws \Exception
     */
    public function __construct(IDb $db, Config $config)
    {
        $this->_db = $db;
        $this->_config = $config;
    }
}
