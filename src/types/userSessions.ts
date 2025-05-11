import { ServerStateResult } from './serverTypes';
import { ServerState } from './state';

export interface UserSessions {
  [userId: string]:
    | {
        isLoading: boolean;
        sessions?: ServerStateResult<ServerState>[];
      }
    | undefined;
}
