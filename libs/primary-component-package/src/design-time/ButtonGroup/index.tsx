import styles from './index.module.less';
import React, { memo, useMemo } from 'react';
import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';

const ButtonGroup: React.FC<IDynamicComponentProps> = memo(props => {
  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const ChildrenComponents = useMemo(() => {
    if (!conf.children || !conf.children.length) { return null; }
    return conf.children.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.children]);

  return (
    <div className={styles['button-group']}>
      <div className={styles['button-group__content']} data-dynamic-component-container='children' data-dynamic-container-owner={conf.id}>
        {ChildrenComponents}
      </div>
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
