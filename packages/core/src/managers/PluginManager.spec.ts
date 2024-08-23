import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PluginManager } from './PluginManager.js';

import type { RuleManager, HookManager } from './index.js';
import type { HijackerContext, Plugin, Rule } from '../schemas/index.js';
import type { Logger } from '../utils/index.js';


describe('PluginManager', () => {
  let mockRuleManager: RuleManager;
  let mockHookManager: HookManager;
  let mockLogger: Logger;

  beforeAll(() => {
    mockLogger = { level: 'NONE', log: vi.fn() };

    mockRuleManager = {
      logger: mockLogger,
      ruleTypes: {},
      rules: [],
      scenario: 'default',
      scenarios: [],
      baseRule: {
        baseUrl: ''
      },

      init: vi.fn(),
      addRuleTypes: vi.fn(),
      addRule: vi.fn(),
      updateRule: vi.fn(),
      deleteRules: vi.fn(),
      match: vi.fn(),
      handler: vi.fn(),
      events: {
        emit: vi.fn()
      } as any
    };

    mockHookManager = {
      logger: mockLogger,
      hooks: {},
      executeHook: vi.fn(),
      executeSyncHook: vi.fn(),
      registerHandler: vi.fn(),
      registerHook: vi.fn()
    };
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should register plugin', () => {
    expect.assertions(1);

    const context: HijackerContext = {
      eventManager: {} as any,
      hookManager: {} as any,
      logger: mockLogger,
      ruleManager: mockRuleManager
    };

    const plugin = {
      name: 'TestPlugin'
    };

    const pluginManager = new PluginManager({
      context,
      plugins: [plugin]
    });

    expect(pluginManager.plugins).toHaveProperty('TestPlugin');
  });

  it('should pass context to initPlugin', () => {
    expect.assertions(1);

    const context: HijackerContext = {
      eventManager: {} as any,
      hookManager: {} as any,
      logger: mockLogger,
      ruleManager: mockRuleManager
    };

    const plugin: Plugin = {
      name: 'TestPlugin',
      initPlugin(ctx) {
        expect(ctx).toEqual(context);
      },
    };

    new PluginManager({
      context,
      plugins: [plugin]
    });
  });

  it('should register rule types of plugin', () => {
    expect.assertions(1);

    const context: HijackerContext = {
      eventManager: {} as any,
      hookManager: {} as any,
      logger: mockLogger,
      ruleManager: mockRuleManager
    };

    const plugin: Plugin = {
      name: 'TestPlugin',
      ruleTypes: [{
        type: 'TestRule',
        createRule: (rule: Partial<Rule>) => ({ ...rule, id: 'test', baseUrl: 'test' }),
        isMatch() {
          return true;
        },
        handler() {
          return {} as any;
        }
      }]
    };

    new PluginManager({
      context,
      plugins: [plugin]
    });

    expect(mockRuleManager.addRuleTypes).toBeCalledWith(plugin.ruleTypes);
  });

  it('should register plugins rule handlers', () => {
    expect.assertions(2);

    const context: HijackerContext = {
      eventManager: {} as any,
      logger: mockLogger,
      hookManager: mockHookManager,
      ruleManager: mockRuleManager
    };

    const plugin = {
      name: 'TestPlugin',
      handlers: {
        'HIJACKER_CONFIG': (config: any) => config,
        'HIJACKER_TEST': (config: any) => config
      }
    };

    new PluginManager({
      context,
      plugins: [plugin]
    });
    
    expect(mockHookManager.registerHandler)
      .toBeCalledWith('HIJACKER_CONFIG', plugin.handlers['HIJACKER_CONFIG']);

    expect(mockHookManager.registerHandler)
      .toBeCalledWith('HIJACKER_TEST', plugin.handlers['HIJACKER_TEST']);
  });

  it('should register plugins hooks', () => {
    expect.assertions(3);

    const context: HijackerContext = {
      eventManager: {} as any,
      logger: mockLogger,
      hookManager: mockHookManager,
      ruleManager: mockRuleManager
    };

    const guard = () => true;

    const plugin = {
      name: 'TestPlugin',
      hooks: {
        'TESTING': guard,
        'TEST2': guard
      }
    };

    new PluginManager({
      context,
      plugins: [plugin]
    });
    
    expect(mockHookManager.registerHook).toBeCalledTimes(2);
    expect(mockHookManager.registerHook).toBeCalledWith('TESTING', guard);
    expect(mockHookManager.registerHook).toBeCalledWith('TEST2', guard);
  });

  it('should error out with clashing plugin names', () => {
    expect.assertions(1);

    const context: HijackerContext = {
      eventManager: {} as any,
      logger: mockLogger,
      hookManager: mockHookManager,
      ruleManager: mockRuleManager
    };

    const plugin = {
      name: 'TestPlugin'
    };

    expect(() => {
      new PluginManager({
        context,
        plugins: [plugin, plugin]
      });
    }).toThrow('Plugin with name already exists');
  });
});