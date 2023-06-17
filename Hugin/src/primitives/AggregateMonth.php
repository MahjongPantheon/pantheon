<?php
namespace Hugin;

require_once __DIR__ . '/../Primitive.php';

/**
 * Class AggregateMonthPrimitive
 * Primitive for montly aggregated data
 *
 * Low-level model with basic CRUD operations and relations
 * @package Hugin
 */
class AggregateMonthPrimitive extends Primitive
{
    protected static $_table = 'aggregate_month';

    /**
     * Local id
     * @var int | null
     */
    protected $_id;
    /**
     * @var string
     */
    protected $_siteId;
    /**
     * @var string
     */
    protected $_month;
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
        'month'         => '_month',
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
     * @return EventPrimitive[]
     * @throws \Exception
     */
    public static function findById(IDb $db, array $ids)
    {
        return self::_findBy($db, 'id', $ids);
    }

    /**
     * @param IDb $db
     * @return AggregateMonthPrimitive[]
     * @throws \Exception
     */
    public static function findLastYear(IDb $db)
    {
        $result = $db->table(self::$_table)
            ->whereGt('month', date('Y-m-d H:i:s', time() - 12 * 31 * 24 * 60 * 60))
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
    public function getSiteId(): string
    {
        return $this->_siteId;
    }

    /**
     * @param string $siteId
     * @return EventPrimitive
     */
    public function setSiteId(string $siteId): AggregateMonthPrimitive
    {
        $this->_siteId = $siteId;
        return $this;
    }

    /**
     * @return string
     */
    public function getMonth(): string
    {
        return $this->_month;
    }

    /**
     * @param string $month
     * @return EventPrimitive
     */
    public function setMonth(string $month): AggregateMonthPrimitive
    {
        $this->_month = $month;
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
     * @return EventPrimitive
     */
    public function setHostname(?string $hostname): AggregateMonthPrimitive
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
     * @return EventPrimitive
     */
    public function setBrowser(?string $browser): AggregateMonthPrimitive
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
     * @return EventPrimitive
     */
    public function setOs(?string $os): AggregateMonthPrimitive
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
     * @return EventPrimitive
     */
    public function setDevice(?string $device): AggregateMonthPrimitive
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
     * @return EventPrimitive
     */
    public function setScreen(?string $screen): AggregateMonthPrimitive
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
     * @return EventPrimitive
     */
    public function setLanguage(?string $language): AggregateMonthPrimitive
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
     * @return EventPrimitive
     */
    public function setEventType(?string $eventType): AggregateMonthPrimitive
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
     * @return EventPrimitive
     */
    public function setCountry(?string $country): AggregateMonthPrimitive
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
     * @return EventPrimitive
     */
    public function setCity(?string $city): AggregateMonthPrimitive
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
     * @return AggregateMonthPrimitive
     */
    public function setEventCount(int $eventCount): AggregateMonthPrimitive
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
     * @return AggregateMonthPrimitive
     */
    public function setUniqCount(int $uniqCount): AggregateMonthPrimitive
    {
        $this->_uniqCount = $uniqCount;
        return $this;
    }
}
