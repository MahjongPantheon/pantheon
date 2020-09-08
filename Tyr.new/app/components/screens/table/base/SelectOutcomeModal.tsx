import * as React from "react";
import {SelectModal} from '#/components/general/select-modal/SelectModal';
import {ItemSelect} from '#/components/general/select-modal/ItemSelect';

const items: ItemSelect[] = [
  {
    text: 'Ron',
    onSelect: () => {},
  },
  {
    text: 'Tsumo',
    onSelect: () => {},
  },
  {
    text: 'Exhaustive draw',
    onSelect: () => {},
  },
  {
    text: 'Abortive draw',
    onSelect: () => {},
    unavailable: false,
  },
  {
    text: 'Nagashi mangan',
    onSelect: () => {},
    unavailable: false,
  },
  {
    text: 'Chombo',
    onSelect: () => {},
  },
];
export class SelectOutcomeModal extends React.Component<{}> {
  render() {
    return <SelectModal items={items} onHide={() => {}} />
  }
}
