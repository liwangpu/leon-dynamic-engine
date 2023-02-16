import styles from './index.module.less';
import { Tabs as AntdTabs } from 'antd';
import React, { memo, useMemo } from 'react';
import { GenerateShortId, IComponentConfigurationProvider, IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { ITabsComponentConfiguration } from '../../models';

const Tabs: React.FC<IDynamicComponentProps<ITabsComponentConfiguration>> = memo(props => {
  const configuration = props.configuration;
  console.log(`tabs conf:`, configuration);
  // console.log(`render tabs:`,);
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();

  const onTabClick = (key: string, event: MouseEvent) => {
    // console.log(`tab click:`, key);
  };

  const tabItems = useMemo(() => {
    if (!configuration.items?.length) { return null; }
    return configuration.items.map(c => ({ key: c.id, label: c.title, children: (<DynamicComponent configuration={c} key={c.id} />) }));
  }, [configuration.items]);

  return (
    <div className={styles['tabs']} data-dynamic-component={configuration.id}>
      <AntdTabs className='tabs-component' items={tabItems} onTabClick={onTabClick as any} />
    </div>
  );
});

Tabs.displayName = 'Tabs';

export default Tabs;

export const ConfigurationProvider: IComponentConfigurationProvider = async partial => {
  // console.log(`provider:`, partial);
  if (!partial.children?.length) {
    partial.children = [
      {
        id: GenerateShortId(),
        type: 'tab',
        title: '页签1',
        children: []
      }
    ];
  }
  return partial;
};