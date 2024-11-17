import { immutableJSONPatch } from 'immutable-json-patch';
import { v4 as uuid } from 'uuid';

import { RestRuleType } from '../rules/index.js';

import type { EventManager } from './index.js';
import type { HijackerRequest, HijackerContext, HttpRequest, HttpResponse, RuleType, Rule, ProcessedRule } from '../schemas/index.js';
import type { Logger } from '../utils/index.js';

interface RuleManagerInitOptions {
  baseRule: Partial<Rule>;
  rules: Partial<Rule>[];
}

interface RuleManagerOptions {
  logger: Logger;
  eventManager: EventManager;
}

export class RuleManager {
  ruleTypes: Record<string, RuleType> = {};
  rules: ProcessedRule[] = [];
  baseRule: Partial<Rule> = {};
  logger: Logger;
  events: EventManager;
  scenario: string;

  constructor({ logger, eventManager }: RuleManagerOptions) {
    this.logger = logger;
    this.events = eventManager;
    this.scenario = 'default';
  }

  get scenarios() {
    return this.rules.reduce<string[]>((acc, rule) => {
      return rule.scenarios ? [...acc, ...Object.keys(rule.scenarios)] : acc;
    }, []).filter((v, i, a) => a.indexOf(v) === i);
  }

  init({ rules, baseRule }: RuleManagerInitOptions) {
    this.logger.log('DEBUG', '[RuleManager]', 'init');

    this.baseRule = baseRule;
    this.rules = [];
    this.ruleTypes.rest = new RestRuleType();

    for (const rule in rules) {
      this.addRule(rules[rule], false);
    }
  }

  addRuleTypes(ruleTypes: RuleType[]) {
    this.logger.log('DEBUG', '[RuleManager]', 'addRuleTypes');

    ruleTypes.forEach((ruleType) => {
      this.ruleTypes[ruleType.type] = ruleType;
    });
  }

  addRule(rule: Partial<Rule>, emitEvent: boolean = true) {
    this.logger.log('DEBUG', '[RuleManager]', 'addRule');

    const ruleType = rule.type ?? this.baseRule.type ?? 'rest';

    if (ruleType in this.ruleTypes === false) {
      throw new Error(`Cannot register rule for non-existant rule type \`${ruleType}\``);
    }

    const ruleWithId = {
      id: uuid(),
      ...rule
    };

    this.rules.push(ruleWithId);

    if (emitEvent) {
      this.events.emit('RULE_ADDED', ruleWithId);
    }
  }

  updateRule(rule: ProcessedRule) {
    this.logger.log('DEBUG', '[RuleManager]', 'updateRule');

    const index = this.rules.findIndex(x => x.id === rule.id);
    const ruleType = rule.type ?? this.baseRule.type ?? 'rest';

    if (ruleType in this.ruleTypes === false) {
      throw new Error(`Cannot register rule for non-existant rule type \`${ruleType}\``);
    }

    this.rules[index] = {
      ...rule
    };

    this.events.emit('RULE_UPDATED', this.rules[index]);
  }

  deleteRule(id: string) {
    this.logger.log('DEBUG', '[RuleManager]', 'deleteRule');

    this.rules = this.rules.filter(x => id !== x.id);

    this.events.emit('RULE_DELETED', { id });
  }

  match(request: HttpRequest) {
    this.logger.log('DEBUG', '[RuleManager]', 'match');

    let rule = this.rules.find(r => {
      const ruleType = r.type ?? this.baseRule.type ?? 'rest';

      const withBaseRule = this.ruleTypes[ruleType].createRule({
        ...this.baseRule,
        ...r
      });

      return !r.disabled && this.ruleTypes[ruleType].isMatch(request, withBaseRule);
    });

    const scenarios = rule?.scenarios ?? {};

    if (this.scenario !== 'default' && this.scenario in scenarios) {
      const scenario = scenarios[this.scenario];

      if (scenario.type == 'merge') {
        rule = {
          ...rule,
          ...scenario.value
        };
      }

      if (scenario.type == 'patch') {
        rule = immutableJSONPatch(rule, scenario.value);
      }
    }

    const ruleType = rule?.type ?? this.baseRule.type ?? 'rest';

    return this.ruleTypes[ruleType].createRule({
      ...this.baseRule,
      ...rule
    });
  }

  async handler(ruleType: string, request: HijackerRequest, context: HijackerContext): Promise<HttpResponse> {
    this.logger.log('DEBUG', '[RuleManager]', 'handler');

    if (ruleType in this.ruleTypes === false) {
      throw new Error(`Cannot register rule for non-existant rule type \`${ruleType}\``);
    }
  
    return this.ruleTypes[ruleType].handler(
      request,
      context
    );
  }
}
