import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import React, { memo } from 'react';
import styles from './index.module.less';

const Tab: React.FC<IDynamicComponentProps> = memo(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();

  const RenderChildren = () => {
    return conf.children?.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  };

  return (
    <div
      className={styles['tab']}
      data-dynamic-component-container='children'
      data-dynamic-container-owner={conf.id}
    >
      {RenderChildren()}
    </div>
  );
});

Tab.displayName = 'Tab';

export default Tab;