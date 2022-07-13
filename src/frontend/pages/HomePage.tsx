import { Button } from '@mui/material';

import { Rule } from '../components/Rule.js';
import { useConfig } from '../hooks/useConfig.js';

export const HomePage = () => {
  const { rules, addRule, updateRule } = useConfig();

  return (
    <div>
      {rules.map(x => (
        <Rule
          rule={x}
          key={x.id} 
          onChange={updateRule}
        />
      ))}
      <Button onClick={() => {
        addRule({
          baseUrl: 'test',
          path: '/posts',
          skipApi: true,
          body: {
            yolo: 'World'
          }
        });
      }}>
        Add Rule
      </Button>
    </div>
  );
};