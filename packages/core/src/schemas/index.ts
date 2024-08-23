import { z } from 'zod';

import { RuleManager, EventManager, HookManager } from '../managers/index.js';
import { Logger } from '../utils/index.js';

export const HijackerContext = z.object({
  ruleManager: z.lazy(() => z.instanceof(RuleManager)),
  eventManager: z.lazy(() => z.instanceof(EventManager)),
  hookManager: z.lazy(() => z.instanceof(HookManager)),
  logger: z.lazy(() => z.instanceof(Logger))
});

export const LOG_LEVELS = [
  'SILLY',
  'DEBUG',
  'HTTP',
  'INFO',
  'WARN',
  'ERROR',
  'NONE'
] as const;

export const LogLevel = z.enum(LOG_LEVELS);

export const LoggerOptions = z.object({
  level: LogLevel.optional()
});

export const Scenario = z.object({
  type: z.union([z.literal('patch'), z.literal('merge')]),
  value: z.any()
});

export const Rule = z.object({
  id: z.string(),
  disabled: z.boolean().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  baseUrl: z.string(),
  scenarios: z.record(Scenario).optional()
}).passthrough();

export const ProcessedRule = Rule.partial().required({ id: true });

export const HttpMethod = z.enum(['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'TRACE', 'PATCH']);

export const HttpRequest = z.object({
  requestId: z.string(),
  timestamp: z.number(),
  path: z.string(),
  headers: z.record(z.string()),
  body: z.any(),
  method: HttpMethod
});

export const HttpResponse = z.object({
  requestId: z.string(),
  timestamp: z.number(),
  statusCode: z.number(),
  headers: z.record(z.string()),
  body: z.any()
});

export const HijackerRequest = z.object({
  httpReq: HttpRequest,
  matchingRule: Rule
});

export const Handler = z.function().args(z.any()).returns(z.unknown());
export const HookGuard = z.function().args(z.unknown()).returns(z.boolean());

export const RuleType = z.object({
  type: z.string(),
  createRule: z.function().args(Rule.partial()).returns(Rule),
  isMatch: z.function().args(HttpRequest, Rule).returns(z.boolean()),
  handler: z.function().args(HijackerRequest, HijackerContext).returns(z.promise(HttpResponse))
});

export const Plugin =  z.object({
  name: z.string(),
  initPlugin: z.function().args(HijackerContext).returns(z.void()).optional(),
  hooks: z.record(HookGuard).optional(),
  handlers: z.record(Handler).optional(),
  ruleTypes: z.array(RuleType).optional()
});

export const Config = z.object({
  port: z.number(),
  baseRule: Rule.omit({ id: true }).partial(),
  rules: z.array(Rule.omit({ id: true }).partial()),
  plugins: z.array(z.union([Plugin.passthrough(), Plugin])).optional(),
  logger: LoggerOptions.optional()
});

export type Scenario = z.infer<typeof Scenario>;
export type Rule = z.infer<typeof Rule>;
export type ProcessedRule = z.infer<typeof ProcessedRule>;
export type RuleType = z.infer<typeof RuleType>;
export type Handler = z.infer<typeof Handler>;
export type HookGuard = z.infer<typeof HookGuard>;
export type Plugin = z.infer<typeof Plugin>;
export type HttpMethod = z.infer<typeof HttpMethod>;
export type HttpRequest = z.infer<typeof HttpRequest>;
export type HttpResponse = z.infer<typeof HttpResponse>;
export type HijackerRequest = z.infer<typeof HijackerRequest>;
export type HijackerContext = z.infer<typeof HijackerContext>;
export type LogLevel = z.infer<typeof LogLevel>;
export type LoggerOptions = z.infer<typeof LoggerOptions>;
export type Config = z.infer<typeof Config>;