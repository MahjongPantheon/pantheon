import {IAppState} from '../interfaces';

export const isLoading = (state: IAppState) => state.loading.overview || state.loading.addRound;
