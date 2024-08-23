import { useEffect, useState } from 'react';

import { RuleList } from '../components/RuleList';
import { trpc } from '../util/trpc';

export const Home = () => {
  const { data } = trpc.getRules.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false
  });

  const [rules, setRules] = useState(data ?? []);

  trpc.onRuleUpdated.useSubscription(undefined, {
    onData: (data) => {
      setRules((prev) => {
        const idx = prev.findIndex((r) => r.id === data.id);
        if (idx === -1) {
          return prev;
        }

        return [...prev.slice(0, idx), data, ...prev.slice(idx + 1)];
      });
    }
  });

  useEffect(() => {
    setRules(data ?? []);
  }, [data, setRules]);

  return (
    <div>
      <RuleList rules={rules} />
    </div>
  );
};