<?php
namespace Hugin;

class Config
{
    /**
     * @var array|mixed|string
     */
    protected $_data;

    /**
     * @param string|array $fileOrSource config file location
     */
    public function __construct($fileOrSource)
    {
        if (is_array($fileOrSource)) { // not file name, just whole config
            $this->_data = $fileOrSource;
        } else {
            $this->_data = require $fileOrSource;
        }
    }

    /**
     * Get config value by dot-separated path
     *
     * @param string $path
     * @return mixed
     */
    public function getValue(string $path)
    {
        $parts = explode('.', $path);
        $current = $this->_data;
        while ($part = array_shift($parts)) {
            $current = $current[$part];
        }

        return $current;
    }

    /**
     * @return string  PDO connection string
     * @throws \RuntimeException
     */
    public function getDbConnectionString()
    {
        $value = $this->getValue('db.connection_string');
        if (empty($value)) {
            throw new \RuntimeException('DB connection string not found in configuration!');
        }

        return $value;
    }

    /**
     * @return string[] with username and password
     */
    public function getDbConnectionCredentials()
    {
        return $this->getValue('db.credentials');
    }

    /**
     * @return array
     */
    public function getDbDriverOptions()
    {
        return [\PDO::ATTR_PERSISTENT => true];
    }
}
