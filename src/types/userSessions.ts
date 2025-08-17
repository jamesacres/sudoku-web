import { ServerStateResult } from './serverTypes';
import { ServerState } from './state';

export interface UserSession {
  isLoading: boolean;
  sessions?: ServerStateResult<ServerState>[];
}

export interface UserSessions {
  [userId: string]: UserSession | undefined;
}
