import { Server } from 'socket.io';
import { Socket } from 'socket.io-client';

import { IRule } from '../rules/Rule';
import { Config } from './Config';

export interface ClientToServerEvents {
  ADD_RULES: (rule: Partial<IRule>[]) => void;
  UPDATE_RULES: (rule: Partial<IRule>[]) => void;
  DELETE_RULES: (ids: string[]) => void;
}

export interface ServerToClientEvents {
  SETTINGS: (config: Config) => void;
  UPDATE_RULES: (rules: Partial<IRule>[]) => void;
}

export type HijackerSocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;
export type HijackerSocketServer = Server<ClientToServerEvents, ServerToClientEvents>;