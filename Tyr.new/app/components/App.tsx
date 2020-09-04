import * as React from 'react';
import { Store } from "#/store";
import '../styles/base.css'
import '../styles/themes.css'
import '../styles/variables.css'
import {IAppState} from '#/store/interfaces';
import {Root} from '#/components/Root';
import {INIT_STATE, STARTUP_WITH_AUTH} from '#/store/actions/interfaces';

interface IProps {
  store: Store;
}

export class App extends React.PureComponent<IProps, IAppState> {
  constructor(props: IProps) {
    super(props);

    this.state = this.props.store.redux.getState()
  }

  componentDidMount() {
    this.props.store.subscribe(this.onStateChange.bind(this))

    this.props.store.dispatch({type: INIT_STATE});
    this.props.store.dispatch({type: STARTUP_WITH_AUTH});
  }

  onStateChange(state: IAppState) {
    this.setState(this.props.store.redux.getState())
  }

  render() {
    return <Root state={this.state} dispatch={this.props.store.redux.dispatch}/>
  }
}
