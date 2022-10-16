import {
  Config,
  Logs,
  TuneWithDetails,
} from '@hyper-tuner/types';
import { TunesRecord } from '../@types/pocketbase-types';

export interface ConfigState extends Config {}

export interface TuneState extends TuneWithDetails {}

export interface TuneDataState extends TunesRecord {}

export interface LogsState extends Logs {}

export interface UIState {
  sidebarCollapsed: boolean;
}

export interface StatusState {
  text: string | null;
}

export interface NavigationState {
  tuneId: string | null;
}

export interface AppState {
  tune: TuneState;
  tuneData: TuneDataState;
  config: ConfigState;
  logs: LogsState,
  ui: UIState;
  status: StatusState;
  navigation: NavigationState;
}

export interface UpdateTunePayload {
  name: string;
  value: string | number;
}
