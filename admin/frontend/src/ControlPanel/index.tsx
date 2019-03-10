import React, { ReactElement, useState, useEffect } from 'react';
import LimitSelector from './LimitSelector';
import { OneStat } from './stat-types';
import StatDisplay from './StatDisplay';

export default (): ReactElement => {
  const [limit, setLimit] = useState(1);
  const [stat, setStat] = useState<OneStat[] | null>(null);

  useEffect(() => {
    (async () => {
      const resp = await fetch(`/api/recent-stat?limit=${limit}`);
      const stats: OneStat[] = await resp.json();
      setStat(stats);
      console.log(stats);
    })();
  }, [limit]);

  return (
    <div>
      <LimitSelector limit={limit} onLimitChange={setLimit} />
      <StatDisplay stats={stat} />
    </div>
  );
};
