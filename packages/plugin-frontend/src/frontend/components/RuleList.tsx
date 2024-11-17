import { Accordion, Button, Flex, Switch, Text } from '@mantine/core';
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
  const deleteRule = trpc.deleteRule.useMutation();

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

  const onSwitchToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Warn if user has unsaved changes in ruleSource
    updateRule.mutate({
      ...rule,
      disabled: !e.target.checked
    });
  };

  return (
    <Accordion.Item value={rule.id}>
      <Accordion.Control>
        <Flex align="center" justify="space-between" mr="sm">
          <Text>{rule.path as string}</Text>
          <Switch
            checked={!rule.disabled}
            onChange={onSwitchToggle}
          />
        </Flex>
      </Accordion.Control>
      <Accordion.Panel>
        <Editor
          value={ruleSource}
          onChange={handleSourceChange}
        />
        <Flex gap="md" justify="flex-end" mt="sm">
          <Button color="red" onClick={() => deleteRule.mutate({ id: rule.id })}>Delete</Button>
          <Button onClick={onSaveRule}>Save</Button>
        </Flex>
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