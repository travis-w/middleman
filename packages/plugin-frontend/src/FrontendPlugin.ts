import { Server } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import express from 'express';

import { createTRPCAppRouter } from './trpc.js';
import { HistoryItem } from './types/index.js';

import type { Handler, HijackerContext, HttpRequest, HttpResponse, Plugin } from '@hijacker/core';

interface FrontendPluginOptions {
  name?: string;
  port: number;
  devMode?: boolean;
}

export class FrontendPlugin implements Plugin {
  name: string;
  handlers: Record<string, Handler>;

  private app: express.Application;
  private server: Server;
  private port: number;
  private tempHistory: HistoryItem[];
  private devMode: boolean;

  constructor({ name, port, devMode }: FrontendPluginOptions) {
    this.name = name ?? 'frontend';
    this.devMode = devMode ?? false;
    
    this.port = port;
    this.app = express();
    this.server = new Server(this.app);
    this.tempHistory = [];

    // Register handlers
    this.handlers = {
      HIJACKER_REQUEST: this.onHijackerRequest.bind(this),
      HIJACKER_RESPONSE: this.onHijackerResponse.bind(this)
    };

    if (this.devMode) {
      this.app.use(cors());
    }
  }

  initPlugin({ logger, ruleManager, eventManager }: HijackerContext) {
    this.app.use(
      '/trpc',
      createExpressMiddleware({
        router: createTRPCAppRouter({ ruleManager, eventManager })
      }),
    );

    if (!this.devMode) {
      this.app
        .use('/assets', express.static(join(dirname(fileURLToPath(import.meta.url)), './frontend/assets'), { fallthrough: false,  }))
        .get('*', (_, res) => {
          res.sendFile(join(dirname(fileURLToPath(import.meta.url)), './frontend', 'index.html'));
        });
    }
    
    this.server.listen(this.port, () => {
      logger.log('INFO', `[Frontend] Frontend listening on port: ${this.port}`);
    });
  }

  // For now just send to history. Will eventually have breakpoints in these
  async onHijackerRequest(req: HttpRequest): Promise<HttpRequest> {
    // Only sending history over sockets and storing on frontend inmemory.
    //    Using tempHistory allows full request lifecycles to always be seen in case frontend
    //    only recieves one of the later events.
    const historyItem: HistoryItem = {
      requestId: req.requestId,
      hijackerRequest: req
    };

    // TODO: Need to make this work with TRPC
    // this.io.emit('HISTORY_EVENT', historyItem);

    this.tempHistory.push(historyItem);

    return req;
  }

  async onHijackerResponse(res: HttpResponse): Promise<HttpResponse> {
    const historyItem = this.tempHistory.find(x => x.requestId === res.requestId)!;

    historyItem.hijackerResponse = res;

    // TODO: Need to make this work with TRPC
    // this.io.emit('HISTORY_EVENT', historyItem);
  
    // Remove from temp history after request is finished
    this.tempHistory = this.tempHistory.filter(x => x.requestId !== res.requestId);

    return res;
  }

  async close() {
    return new Promise<void>(async (done) => {
      this.server.closeAllConnections();
      this.server.close(() => {
        done();
      });
    });
  }
}