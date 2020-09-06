import * as React from 'react';
import '../styles/base.css'
import '../styles/themes.css'
import '../styles/variables.css'
import {IAppState} from '#/store/interfaces';
import {Root} from '#/components/Root';
import { AppActionTypes, INIT_STATE, STARTUP_WITH_AUTH } from '#/store/actions/interfaces';
import { Dispatch } from "redux";
import { IDB } from "#/services/idb";

interface IProps {
  state: IAppState;
  dispatch: Dispatch<AppActionTypes>;
  storage: IDB;
}

export class App extends React.PureComponent<IProps, IAppState> {
  componentDidMount() {
    this.props.dispatch({type: INIT_STATE});
    this.props.dispatch({type: STARTUP_WITH_AUTH, payload: this.props.storage.get('authToken') || ''});
  }

  render() {
    return <Root state={this.props.state} dispatch={this.props.dispatch}/>
  }
}
