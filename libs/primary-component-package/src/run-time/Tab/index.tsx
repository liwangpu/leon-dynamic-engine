import styles from './index.module.less';
import React, { memo } from 'react';
import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';

const Tab: React.FC<IDynamicComponentProps> = memo(props => {
  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  // const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  console.log(`tab:`,conf);
  // const bodyComponents = () => {
  //   return !config.body?.length ? null : config.body.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  // };
  return (
    <div className={styles['tab']} data-dynamic-component={conf.id}>
      <div className={styles['tab__content']} data-dynamic-component-container={conf.id} data-dynamic-container-owner={conf.id}>
        <p>{conf.title}</p>
        {/* {bodyComponents()} */}
      </div>
    </div>
  );
});

Tab.displayName = 'Tab';

export default Tab;
