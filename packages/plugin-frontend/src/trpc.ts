import { RuleManager } from '@hijacker/core';
import { initTRPC } from '@trpc/server';

interface TRPCServerOptions {
  ruleManager: RuleManager;
}

export const createTRPCAppRouter = ({ ruleManager }: TRPCServerOptions) => {
  const t = initTRPC.create();

  return t.router({
    getRules: t.procedure.query(() => ruleManager.rules)
  });
};

export type AppRouter = ReturnType<typeof createTRPCAppRouter>; 

