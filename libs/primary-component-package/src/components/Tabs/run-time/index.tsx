import { IDynamicComponentProps, useDataCenter, useDynamicComponentEngine, useStateCenter } from '@lowcode-engine/core';
import React, { memo, useEffect, useMemo } from 'react';
import { Tabs as AntdTabs } from 'antd';
import styles from './index.module.less';
import { ITabsComponentConfiguration } from '../../../models';

const Tabs: React.FC<IDynamicComponentProps<ITabsComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const children = conf.children || [];
  const dynamicEngine = useDynamicComponentEngine();
  // const { setState } = useDataCenter(conf);
  const [activeKey, setActiveKey] = useStateCenter<string>(conf.id, 'activeKey');
  const DynamicComponent = dynamicEngine.getDynamicComponentFactory();
  const isVertical = conf.direction === 'vertical';
  // console.log(`tabs:`, conf, props.style);

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

  useEffect(() => {
    setActiveKey(conf.defaultActiveTab);
  }, []);

  return (
    <div className={styles['tabs']} style={props.style}>
      <AntdTabs
        className='runtime-tabs'
        defaultActiveKey={conf.defaultActiveTab}
        tabPosition={isVertical ? 'left' : 'top'}
        onChange={tabId => setActiveKey(tabId)}
        items={Items}
      />
    </div>
  );
});

Tabs.displayName = 'Tabs';

export default Tabs;