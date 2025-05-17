<?php
require_once __DIR__ . '/../../../Common/rulesets/Ruleset.php';
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
                $base->rules()->setAllowedYaku(array_map('intval', $changes['allowedYaku']));
            }
            if (isset($changes['chomboPenalty'])) {
                $base->rules()->setChomboAmount((int)$changes['chomboAmount']);
            }
            if (isset($changes['equalizeUma'])) {
                $base->rules()->setEqualizeUma((bool)$changes['equalizeUma']);
            }
            if (isset($changes['goalPoints'])) {
                $base->rules()->setGoalPoints((int)$changes['goalPoints']);
            }
            if (isset($changes['maxPenalty'])) {
                $base->rules()->setMaxPenalty((int)$changes['maxPenalty']);
            }
            if (isset($changes['minPenalty'])) {
                $base->rules()->setMinPenalty((int)$changes['minPenalty']);
            }
            if (isset($changes['oka'])) {
                $base->rules()->setOka((int)$changes['oka']);
            }
            if (isset($changes['penaltyStep'])) {
                $base->rules()->setPenaltyStep((int)$changes['penaltyStep']);
            }
            if (isset($changes['replacementPlayerOverrideUma'])) {
                $base->rules()->setReplacementPlayerOverrideUma((int)$changes['replacementPlayerOverrideUma']);
            }
            if (isset($changes['riichiGoesToWinner'])) {
                $base->rules()->setRiichiGoesToWinner((bool)$changes['riichiGoesToWinner']);
            }
            $base->rules()->setUmaType(isset($changes['complexUma']) && $changes['complexUma']
                ? \Common\UmaType::UMA_TYPE_UMA_COMPLEX
                : \Common\UmaType::UMA_TYPE_UMA_SIMPLE);
            if (isset($changes['uma'])) {
                $base->rules()->setUma((new \Common\Uma())
                    ->setPlace1((int)$changes['uma'][1])
                    ->setPlace2((int)$changes['uma'][2])
                    ->setPlace3((int)$changes['uma'][3])
                    ->setPlace4((int)$changes['uma'][4])
                );
            }
            if (isset($changes['withKuitan'])) {
                $base->rules()->setWithKuitan((bool)$changes['withKuitan']);
            }
            if (isset($changes['yakuWithPao'])) {
                $base->rules()->setYakuWithPao(array_map('intval', $changes['yakuWithPao']));
            }
            if (isset($changes['doubleYakuman'])) {
                $base->rules()->setDoubleYakuman(array_map('intval', $changes['doubleYakuman']));
            }
            if (isset($changes['doubleronHonbaAtamahane'])) {
                $base->rules()->setDoubleronHonbaAtamahane((bool)$changes['doubleronHonbaAtamahane']);
            }
            if (isset($changes['doubleronRiichiAtamahane'])) {
                $base->rules()->setDoubleronRiichiAtamahane((bool)$changes['doubleronRiichiAtamahane']);
            }
            if (isset($changes['extraChomboPayments'])) {
                $base->rules()->setExtraChomboPayments((bool)$changes['extraChomboPayments']);
            }
            if (isset($changes['gameExpirationTime'])) {
                $base->rules()->setGameExpirationTime((int)$changes['gameExpirationTime']);
            }
            if (isset($changes['playAdditionalRounds'])) {
                $base->rules()->setPlayAdditionalRounds((bool)$changes['playAdditionalRounds']);
            }
            if (isset($changes['tonpuusen'])) {
                $base->rules()->setTonpuusen((bool)$changes['tonpuusen']);
            }
            if (isset($changes['withAbortives'])) {
                $base->rules()->setWithAbortives((bool)$changes['withAbortives']);
            }
            if (isset($changes['withAtamahane'])) {
                $base->rules()->setWithAtamahane((bool)$changes['withAtamahane']);
            }
            if (isset($changes['withButtobi'])) {
                $base->rules()->setWithButtobi((bool)$changes['withButtobi']);
            }
            if (isset($changes['withKazoe'])) {
                $base->rules()->setWithKazoe((bool)$changes['withKazoe']);
            }
            if (isset($changes['withKiriageMangan'])) {
                $base->rules()->setWithKiriageMangan((bool)$changes['withKiriageMangan']);
            }
            if (isset($changes['withLeadingDealerGameOver'])) {
                $base->rules()->setWithLeadingDealerGameOver((bool)$changes['withLeadingDealerGameOver']);
            }
            if (isset($changes['withMultiYakumans'])) {
                $base->rules()->setWithMultiYakumans((bool)$changes['withMultiYakumans']);
            }
            if (isset($changes['withNagashiMangan'])) {
                $base->rules()->setWithNagashiMangan((bool)$changes['withNagashiMangan']);
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
