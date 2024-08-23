import { Accordion, Button } from '@mantine/core';
import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';

import { trpc } from '../util/trpc';

import { Editor } from './Editor';

import type { ProcessedRule } from '@hijacker/core';

interface RuleProps {
  rule: ProcessedRule;
}

interface RuleListProps {
  rules: ProcessedRule[];
}

const Rule: React.FC<RuleProps> = ({ rule }) => {
  const [ruleSource, setRuleSource] = useState(JSON.stringify(rule, null, 2));
  const updateRule = trpc.updateRule.useMutation();

  useEffect(() => {
    try {
      const curVal = JSON.parse(ruleSource);

      if (!isEqual(curVal, rule)) {
        setRuleSource(JSON.stringify(rule, null, 2));
      }
    } catch {
      setRuleSource(JSON.stringify(rule, null, 2));
    }
  }, [rule]);

  const handleSourceChange = (val?: string) => {
    if (val) {
      setRuleSource(val);
    }
  };

  const onSaveRule = () => {
    try {
      const newVal = JSON.parse(ruleSource);
      if (!isEqual(newVal, rule)) {
        updateRule.mutate(newVal);
      }
    } catch {
      console.error('Invalid rule object');
    }
  };

  return (
    <Accordion.Item value={rule.id}>
      <Accordion.Control>{rule.path as string}</Accordion.Control>
      <Accordion.Panel>
        <Editor
          value={ruleSource}
          onChange={handleSourceChange}
        />
        <Button onClick={onSaveRule}>Save</Button>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export const RuleList: React.FC<RuleListProps> = ({ rules }) => {
  return (
    <Accordion variant="separated">
      {rules.map(rule => (
        <Rule key={rule.id} rule={rule} />
      ))}
    </Accordion>
  );
};