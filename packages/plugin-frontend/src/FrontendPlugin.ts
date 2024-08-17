import { Server } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import { Server as SocketServer } from 'socket.io';

import { HijackerSocketServer, HistoryItem } from './types/index.js';

import type { Handler, HijackerContext, HttpRequest, HttpResponse, Plugin, Rule, ProcessedRule } from '@hijacker/core';

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
  private io: HijackerSocketServer;
  private tempHistory: HistoryItem[];
  private devMode: boolean = false;

  constructor({ name, port }: FrontendPluginOptions) {
    this.name = name ?? 'frontend';
    
    this.port = port;
    this.app = express();
    this.server = new Server(this.app);
    this.io = new SocketServer(this.server, {
      maxHttpBufferSize: 1e8,
      cors: {
        origin: true
      }
    });
    this.tempHistory = [];

    // Register handlers
    this.handlers = {
      HIJACKER_REQUEST: this.onHijackerRequest.bind(this),
      HIJACKER_RESPONSE: this.onHijackerResponse.bind(this)
    };
  }

  initPlugin({ logger, ruleManager, eventManager }: HijackerContext) {
    if (!this.devMode) {
      this.app
        .use('/assets', express.static(join(dirname(fileURLToPath(import.meta.url)), './frontend/assets'), { fallthrough: false,  }))
        .get('*', (_, res) => {
          res.sendFile(join(dirname(fileURLToPath(import.meta.url)), './frontend', 'index.html'));
        });
    }

    this.io.on('connection', (socket) => {
      socket.emit('SETTINGS', {
        port: 123,
        baseRule: ruleManager.baseRule,
        rules: ruleManager.rules
      });

      socket.on('UPDATE_BASE_RULE', (rule: Partial<Rule>) => {
        ruleManager.baseRule = rule;
        this.io.emit('BASE_RULE_UPDATED', rule);
      });

      socket.on('UPDATE_RULES', (rules: ProcessedRule[]) => {
        rules.forEach((rule) => ruleManager.updateRule(rule));
      });

      socket.on('ADD_RULES', (rules: Partial<Rule>[]) => {
        ruleManager.addRules(rules);
      });

      socket.on('DELETE_RULES', (ids: string[]) => {
        ruleManager.deleteRules(ids);
      });
    });

    eventManager.on('RULES_UPDATED', (rules) => {
      this.io.emit('RULES_UPDATED', rules);
    });
    
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

    this.io.emit('HISTORY_EVENT', historyItem);

    this.tempHistory.push(historyItem);

    return req;
  }

  async onHijackerResponse(res: HttpResponse): Promise<HttpResponse> {
    const historyItem = this.tempHistory.find(x => x.requestId === res.requestId)!;

    historyItem.hijackerResponse = res;

    this.io.emit('HISTORY_EVENT', historyItem);
  
    // Remove from temp history after request is finished
    this.tempHistory = this.tempHistory.filter(x => x.requestId !== res.requestId);

    return res;
  }
}