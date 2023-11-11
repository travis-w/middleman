import { describe, it, expect } from 'vitest';

import { RestRuleType } from './index.js';
import type { HttpRequest } from '../schemas/index.js';

describe('RestRule', () => {
  describe('isMatch', () => {
    it('should match correct path', () => {
      expect.assertions(2);

      const ruleType = new RestRuleType();
  
      const rule = ruleType.createRule({
        path: '/test-route',
        method: 'POST'
      });
  
      const reqOne = { path: '/test-route/1', method: 'POST' } as HttpRequest;
      const reqTwo = { path: '/test-route', method: 'POST' } as HttpRequest;
  
      expect(ruleType.isMatch(reqOne, rule)).toBe(false);
      expect(ruleType.isMatch(reqTwo, rule)).toBe(true);
    });
  
    it('should match correct method', () => {
      expect.assertions(2);

      const ruleType = new RestRuleType();
  
      const rule = ruleType.createRule({
        path: '/test-route',
        method: 'POST'
      });
  
      const reqOne = { path: '/test-route', method: 'POST' } as HttpRequest;
      const reqTwo = { path: '/test-route', method: 'GET' } as HttpRequest;
  
      expect(ruleType.isMatch(reqOne, rule)).toBe(true);
      expect(ruleType.isMatch(reqTwo, rule)).toBe(false);
    });
  
    it('should match ALL method', () => {
      expect.assertions(2);

      const ruleType = new RestRuleType();
  
      const rule = ruleType.createRule({
        path: '/test-route',
        method: 'ALL'
      });
  
      const reqOne = { path: '/test-route', method: 'POST' } as HttpRequest;
      const reqTwo = { path: '/test-route', method: 'GET' } as HttpRequest;
  
      expect(ruleType.isMatch(reqOne, rule)).toBe(true);
      expect(ruleType.isMatch(reqTwo, rule)).toBe(true);
    });
  
    it('should match parameters in path', () => {
      expect.assertions(2);
      
      const ruleType = new RestRuleType();
  
      const rule = ruleType.createRule({
        path: '/test-route/:id',
        method: 'POST'
      });
  
      const reqOne = { path: '/test-route/12', method: 'POST' } as HttpRequest;
      const reqTwo = { path: '/test-route', method: 'POST' } as HttpRequest;
  
      expect(ruleType.isMatch(reqOne, rule)).toBe(true);
      expect(ruleType.isMatch(reqTwo, rule)).toBe(false);
    });
  });
  
  describe('handler', () => {
    it('should handle a rest request correctly', () => {
      // const ruleType = new RestRuleType();
  
      // expect(ruleType.handler).toThrow();
    });
  });
});