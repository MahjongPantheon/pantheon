<?php
namespace Hugin;

require_once __DIR__ . '/../Primitive.php';

/**
 * Class AggregateDayPrimitive
 * Primitive for daily aggregated data
 *
 * Low-level model with basic CRUD operations and relations
 * @package Hugin
 */
class AggregateDayPrimitive extends Primitive
{
    protected static $_table = 'aggregate_day';

    /**
     * Local id
     * @var int | null
     */
    protected $_id;
    /**
     * @var string
     */
    protected $_day;
    /**
     * @var string
     */
    protected $_siteId;
    /**
     * @var int
     */
    protected $_eventCount;
    /**
     * @var int
     */
    protected $_uniqCount;
    /**
     * @var string|null
     */
    protected $_hostname;
    /**
     * @var string|null
     */
    protected $_browser;
    /**
     * @var string|null
     */
    protected $_os;
    /**
     * @var string|null
     */
    protected $_device;
    /**
     * @var string|null
     */
    protected $_screen;
    /**
     * @var string|null
     */
    protected $_language;
    /**
     * @var string|null
     */
    protected $_eventType;
    /**
     * @var string|null
     */
    protected $_country;
    /**
     * @var string|null
     */
    protected $_city;

    protected static $_fieldsMapping = [
        'id'            => '_id',
        'day'           => '_day',
        'site_id'       => '_siteId',
        'event_count'   => '_eventCount',
        'uniq_count'    => '_uniqCount',
        'hostname'      => '_hostname',
        'browser'       => '_browser',
        'os'            => '_os',
        'device'        => '_device',
        'screen'        => '_screen',
        'language'      => '_language',
        'event_type'    => '_eventType',
        'country'       => '_country',
        'city'          => '_city',
    ];

    protected function _create()
    {
        $ev = $this->_db->table(static::$_table)->create();
        $success = $this->_save($ev);
        if ($success) {
            $this->_id = $this->_db->lastInsertId();
        }

        return $success;
    }

    protected function _deident()
    {
        $this->_id = null;
    }

    /**
     * @param IDb $db
     * @param int[] $ids
     *
     * @return AggregateDayPrimitive[]
     * @throws \Exception
     */
    public static function findById(IDb $db, array $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * @param IDb $db
     * @return AggregateDayPrimitive[]
     * @throws \Exception
     */
    public static function findLastMonth(IDb $db)
    {
        $result = $db->table(self::$_table)
            ->whereGt('day', date('Y-m-d H:i:s', time() - 30 * 24 * 60 * 60))
            ->findArray();
        return array_map(function ($data) use ($db) {
            return self::_recreateInstance($db, $data);
        }, $result);
    }

    /**
     * @return int | null
     */
    public function getId()
    {
        return $this->_id;
    }

    /**
     * @return string
     */
    public function getDay(): string
    {
        return $this->_day;
    }

    /**
     * @param string $day
     * @return AggregateDayPrimitive
     */
    public function setDay(string $day): AggregateDayPrimitive
    {
        $this->_day = $day;
        return $this;
    }

    /**
     * @return string
     */
    public function getSiteId(): string
    {
        return $this->_siteId;
    }

    /**
     * @param string $siteId
     * @return AggregateDayPrimitive
     */
    public function setSiteId(string $siteId): AggregateDayPrimitive
    {
        $this->_siteId = $siteId;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getHostname(): ?string
    {
        return $this->_hostname;
    }

    /**
     * @param string|null $hostname
     * @return AggregateDayPrimitive
     */
    public function setHostname(?string $hostname): AggregateDayPrimitive
    {
        $this->_hostname = $hostname;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getBrowser(): ?string
    {
        return $this->_browser;
    }

    /**
     * @param string|null $browser
     * @return AggregateDayPrimitive
     */
    public function setBrowser(?string $browser): AggregateDayPrimitive
    {
        $this->_browser = $browser;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getOs(): ?string
    {
        return $this->_os;
    }

    /**
     * @param string|null $os
     * @return AggregateDayPrimitive
     */
    public function setOs(?string $os): AggregateDayPrimitive
    {
        $this->_os = $os;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getDevice(): ?string
    {
        return $this->_device;
    }

    /**
     * @param string|null $device
     * @return AggregateDayPrimitive
     */
    public function setDevice(?string $device): AggregateDayPrimitive
    {
        $this->_device = $device;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getScreen(): ?string
    {
        return $this->_screen;
    }

    /**
     * @param string|null $screen
     * @return AggregateDayPrimitive
     */
    public function setScreen(?string $screen): AggregateDayPrimitive
    {
        $this->_screen = $screen;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getLanguage(): ?string
    {
        return $this->_language;
    }

    /**
     * @param string|null $language
     * @return AggregateDayPrimitive
     */
    public function setLanguage(?string $language): AggregateDayPrimitive
    {
        $this->_language = $language;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getEventType(): ?string
    {
        return $this->_eventType;
    }

    /**
     * @param string|null $eventType
     * @return AggregateDayPrimitive
     */
    public function setEventType(?string $eventType): AggregateDayPrimitive
    {
        $this->_eventType = $eventType;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getCountry(): ?string
    {
        return $this->_country;
    }

    /**
     * @param string|null $country
     * @return AggregateDayPrimitive
     */
    public function setCountry(?string $country): AggregateDayPrimitive
    {
        $this->_country = $country;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getCity(): ?string
    {
        return $this->_city;
    }

    /**
     * @param string|null $city
     * @return AggregateDayPrimitive
     */
    public function setCity(?string $city): AggregateDayPrimitive
    {
        $this->_city = $city;
        return $this;
    }

    /**
     * @return int
     */
    public function getEventCount(): int
    {
        return $this->_eventCount;
    }

    /**
     * @param int $eventCount
     * @return AggregateDayPrimitive
     */
    public function setEventCount(int $eventCount): AggregateDayPrimitive
    {
        $this->_eventCount = $eventCount;
        return $this;
    }

    /**
     * @return int
     */
    public function getUniqCount(): int
    {
        return $this->_uniqCount;
    }

    /**
     * @param int $uniqCount
     * @return AggregateDayPrimitive
     */
    public function setUniqCount(int $uniqCount): AggregateDayPrimitive
    {
        $this->_uniqCount = $uniqCount;
        return $this;
    }
}
