import { on } from 'node:events';

import { RuleManager, Rule, ProcessedRule, EventManager } from '@hijacker/core';
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

interface TRPCServerOptions {
  ruleManager: RuleManager;
  eventManager: EventManager;
}

export const createTRPCAppRouter = ({ ruleManager, eventManager }: TRPCServerOptions) => {
  const t = initTRPC.create();

  return t.router({
    getRules: t.procedure.query(() => ruleManager.rules),
    getScenarios: t.procedure.query(() => ruleManager.scenarios),
    getActiveScenario: t.procedure.query(() => ruleManager.scenario),
    onRuleUpdated: t.procedure.subscription(async function* () {
      for await (const [rule] of on(eventManager.events, 'RULE_UPDATED')) {
        yield rule as ProcessedRule;
      }
    }),
    onRuleDeleted: t.procedure.subscription(async function* () {
      for await (const [rule] of on(eventManager.events, 'RULE_DELETED')) {
        yield rule as Pick<Rule, 'id'>;
      }
    }),
    addRule: t.procedure
      .input(Rule.partial()).mutation((opts) => {
        ruleManager.addRule(opts.input);
      }),
    updateRule: t.procedure
      .input(ProcessedRule)
      .mutation((opts) => {
        try {
          ruleManager.updateRule(opts.input);
        } catch {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'There was an error updating the rule'
          });
        }
      }),
    deleteRule: t.procedure
      .input(Rule.pick({ id: true })).mutation((opts) => {
        ruleManager.deleteRule(opts.input.id);
      }),
    setActiveScenario: t.procedure
      .input(z.string()).mutation((opts) => {
        if (!ruleManager.scenarios.includes(opts.input)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Scenario \`${opts.input}\` does not exist`,
          });
        }

        ruleManager.scenario = opts.input;
      })
  });
};

export type AppRouter = ReturnType<typeof createTRPCAppRouter>; 

