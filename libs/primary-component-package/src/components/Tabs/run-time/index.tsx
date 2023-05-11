import { IDynamicComponentProps, useDataCenter, useDynamicComponentEngine } from '@lowcode-engine/core';
import React, { memo, useMemo } from 'react';
import { Tabs as AntdTabs } from 'antd';
import styles from './index.module.less';
import { ITabsComponentConfiguration } from '../../../models';

const Tabs: React.FC<IDynamicComponentProps<ITabsComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const children = conf.children || [];
  const dynamicEngine = useDynamicComponentEngine();
  const { setState } = useDataCenter(conf);
  const DynamicComponent = dynamicEngine.getDynamicComponentFactory();
  const isVertical = conf.direction === 'vertical';

  const Items = useMemo(() => {
    if (!children || !children.length) { return []; }
    return children.map(c => ({
      key: c.id,
      label: c.title,
      children: (
        <>
          {c.children && c.children.map(it => (
            <DynamicComponent key={it.id} configuration={it} />
          ))}
        </>
      )
    }));
  }, [children]);

  const onTabChange = (tabId: string) => {
    // console.log(`tab:`, e);
    // setState('activeKey', tabId);
    setState('activeKey', tabId);
  };

  return (
    <div className={styles['tabs']}>
      <AntdTabs
        className='runtime-tabs'
        defaultActiveKey={conf.defaultActiveTab}
        tabPosition={isVertical ? 'left' : 'top'}
        onChange={onTabChange}
        items={Items}
      />
    </div>
  );
});

Tabs.displayName = 'Tabs';

export default Tabs;