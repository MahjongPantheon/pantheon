<?php
require_once __DIR__ . '/../../../Common/generated/Common/EndingPolicy.php';
require_once __DIR__ . '/../../../Common/generated/Common/Uma.php';
require_once __DIR__ . '/../../../Common/generated/Common/UmaType.php';
require_once __DIR__ . '/../../../Common/generated/Common/RulesetConfig.php';
use Phinx\Migration\AbstractMigration;

class MigrateRulesets extends AbstractMigration
{
    public function change()
    {
        $this->table('event')
            ->addColumn('ruleset_config', 'text', ['default' => ''])
            ->changeColumn('ruleset', 'string', ['null' => true])
            ->save();
        $this->adapter->commitTransaction();

        $rulesets = $this->adapter->fetchAll('SELECT id, ruleset, ruleset_changes FROM event');
        $updatedRulesets = array_map(function ($item) {
            $changes = json_decode($item['ruleset_changes'], true);
            $base = \Common\Ruleset::instance($item['ruleset']);
            if (isset($changes['allowedYaku'])) {
                $base->rules()->setAllowedYaku($changes['allowedYaku']);
            }
            if (isset($changes['chomboPenalty'])) {
                $base->rules()->setChipsValue($changes['chomboPenalty']);
            }
            if (isset($changes['equalizeUma'])) {
                $base->rules()->setEqualizeUma($changes['equalizeUma']);
            }
            if (isset($changes['goalPoints'])) {
                $base->rules()->setGoalPoints($changes['goalPoints']);
            }
            if (isset($changes['maxPenalty'])) {
                $base->rules()->setMaxPenalty($changes['maxPenalty']);
            }
            if (isset($changes['minPenalty'])) {
                $base->rules()->setMinPenalty($changes['minPenalty']);
            }
            if (isset($changes['oka'])) {
                $base->rules()->setOka($changes['oka']);
            }
            if (isset($changes['penaltyStep'])) {
                $base->rules()->setPenaltyStep($changes['penaltyStep']);
            }
            if (isset($changes['replacementPlayerOverrideUma'])) {
                $base->rules()->setReplacementPlayerOverrideUma($changes['replacementPlayerOverrideUma']);
            }
            if (isset($changes['riichiGoesToWinner'])) {
                $base->rules()->setRiichiGoesToWinner($changes['riichiGoesToWinner']);
            }
            $base->rules()->setUmaType(isset($changes['complexUma']) && $changes['complexUma']
                ? \Common\UmaType::UMA_COMPLEX
                : \Common\UmaType::UMA_SIMPLE);
            if (isset($changes['uma'])) {
                $base->rules()->setUma((new \Common\Uma())
                    ->setPlace1($changes['uma'][1])
                    ->setPlace2($changes['uma'][2])
                    ->setPlace3($changes['uma'][3])
                    ->setPlace4($changes['uma'][4])
                );
            }
            if (isset($changes['withKuitan'])) {
                $base->rules()->setWithKuitan($changes['withKuitan']);
            }
            if (isset($changes['yakuWithPao'])) {
                $base->rules()->setYakuWithPao($changes['yakuWithPao']);
            }
            if (isset($changes['doubleronHonbaAtamahane'])) {
                $base->rules()->setDoubleronHonbaAtamahane($changes['doubleronHonbaAtamahane']);
            }
            if (isset($changes['doubleronRiichiAtamahane'])) {
                $base->rules()->setDoubleronRiichiAtamahane($changes['doubleronRiichiAtamahane']);
            }
            if (isset($changes['extraChomboPayments'])) {
                $base->rules()->setExtraChomboPayments($changes['extraChomboPayments']);
            }
            if (isset($changes['gameExpirationTime'])) {
                $base->rules()->setGameExpirationTime($changes['gameExpirationTime']);
            }
            if (isset($changes['playAdditionalRounds'])) {
                $base->rules()->setPlayAdditionalRounds($changes['playAdditionalRounds']);
            }
            if (isset($changes['tonpuusen'])) {
                $base->rules()->setTonpuusen($changes['tonpuusen']);
            }
            if (isset($changes['withAbortives'])) {
                $base->rules()->setWithAbortives($changes['withAbortives']);
            }
            if (isset($changes['withAtamahane'])) {
                $base->rules()->setWithAtamahane($changes['withAtamahane']);
            }
            if (isset($changes['withButtobi'])) {
                $base->rules()->setWithButtobi($changes['withButtobi']);
            }
            if (isset($changes['withKazoe'])) {
                $base->rules()->setWithKazoe($changes['withKazoe']);
            }
            if (isset($changes['withKiriageMangan'])) {
                $base->rules()->setWithKiriageMangan($changes['withKiriageMangan']);
            }
            if (isset($changes['withLeadingDealerGameOver'])) {
                $base->rules()->setWithLeadingDealerGameOver($changes['withLeadingDealerGameOver']);
            }
            if (isset($changes['withMultiYakumans'])) {
                $base->rules()->setWithMultiYakumans($changes['withMultiYakumans']);
            }
            if (isset($changes['withNagashiMangan'])) {
                $base->rules()->setWithNagashiMangan($changes['withNagashiMangan']);
            }
            return ['id' => $item['id'], 'ruleset_config' => $base->rules()->serializeToJsonString()];
        }, $rulesets);

        $this->adapter->beginTransaction();
        foreach ($updatedRulesets as $ruleset) {
            $this->adapter->query(
                "UPDATE event SET ruleset_config = '{$ruleset['ruleset_config']}' where id = {$ruleset['id']};"
            );
        }
        $this->adapter->commitTransaction();
    }
}
