import * as React from "react";
import {SelectModal} from '#/components/general/select-modal/SelectModal';
import {ItemSelect} from '#/components/general/select-modal/ItemSelect';

type IProps = {
  possibleValues: number[]
  onChange: (value: number) => void
  onHide: () => void
}

export class SelectNumberModal extends React.Component<IProps> {
  private get items(): ItemSelect[] {
    const {possibleValues, onChange} = this.props;
    let result = possibleValues.map(value => {
      return {
        text: value.toString(),
        onSelect: () => onChange(value)
      } as ItemSelect
    });

    return result;
  }

  render() {
    return <SelectModal items={this.items} onHide={this.props.onHide} />
  }
}
