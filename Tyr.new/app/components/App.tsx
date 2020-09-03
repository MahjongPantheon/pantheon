import * as React from 'react';
import { Store } from "#/store";
import { INIT_STATE } from "#/store/actions/interfaces";

interface Props {
  store: Store;
}

export const App: React.FC<Props> = (props: Props) => {
  props.store.dispatch({ type: INIT_STATE });
  return <div>Hello world azaza</div>;
};
