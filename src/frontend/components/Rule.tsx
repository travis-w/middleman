import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  styled,
  Box,
  Tab,
  Tabs
} from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { debounce, isEqual } from 'lodash';
import { SyntheticEvent, useState } from 'react';

import { IRule } from '../../rules/Rule.js';

interface RuleProps {
  rule: Partial<IRule>;
  onChange?: (rule: Partial<IRule>) => void;
}

interface TabPanelProps {
  children?: JSX.Element | JSX.Element[];
  show: boolean;
}

const RuleMethod = styled(Typography)`
  background-color: #fbf1e6;
  border: 1px solid #e69624;
  color: #000000;
  padding: 2px 10px;
  margin-right: 10px;
`;

const RuleTitle = styled(Typography)`
  padding: 2px 0;
`;

const TabPanel = (props: TabPanelProps) => {
  const { show, children } = props;

  return (
    <div>
      {show && children}
    </div>
  );
};

export const Rule = (props: RuleProps) => {
  const { rule, onChange } = props;

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: SyntheticEvent, val: number) => {
    setActiveTab(val);
  };

  const handleSourceChange = (val: string) => {
    if (onChange && !isEqual(val, rule)) {
      try {
        onChange(JSON.parse(val));
      } catch {
        console.error('Invalid rule object');
      }
    }
  };

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <RuleMethod>POST</RuleMethod>
        <RuleTitle fontWeight="600">{rule.name ?? rule.path}</RuleTitle>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="General" />
            <Tab label="Source" />
          </Tabs>
        </Box>
        <TabPanel show={activeTab === 0}>

        </TabPanel>
        <TabPanel show={activeTab === 1}>
          <CodeMirror
            value={JSON.stringify(rule, null, 2)}
            extensions={[
              json(),
              linter(jsonParseLinter())
            ]}
            onChange={debounce(handleSourceChange, 200)}
          />
        </TabPanel>
      </AccordionDetails>
    </Accordion>
  );
};