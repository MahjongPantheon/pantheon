import * as React from "react";
import './page-enter-pin.css'
import {IComponentProps} from '#/components/IComponentProps';
import {EnterPinScreenView} from '#/components/screens/login/EnterPinScreenView';
import {CONFIRM_REGISTRATION_INIT} from '#/store/actions/interfaces';

export class EnterPinScreen extends React.PureComponent<IComponentProps> {
    private onSubmit(pin: string) {
      const {dispatch} = this.props;
      dispatch({ type: CONFIRM_REGISTRATION_INIT, payload: pin });
    }

    render() {
        return <EnterPinScreenView onSubmit={this.onSubmit.bind(this)} />
    }
}
