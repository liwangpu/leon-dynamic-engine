import styles from './index.module.less';
import React, { memo, useMemo } from 'react';
import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { Dropdown } from 'antd';

const ButtonGroup: React.FC<IDynamicComponentProps> = memo(props => {
  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  // const ChildrenComponents = useMemo(() => {
  //   if (!conf.children || !conf.children.length) { return null; }
  //   return conf.children.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  // }, [conf.children]);

  const onMenuClick = () => {
    // console.log(`title:`,);
  };

  return (
    <div className={styles['button-group']}>
      {/* <div className={styles['button-group__content']} data-dynamic-component-container='children' data-dynamic-container-owner={conf.id}>
        {ChildrenComponents}
      </div> */}
      <div className={styles['button-group__event-blocker']} onClick={onMenuClick}></div>
      <Dropdown.Button menu={{ items: [] }} size='small'>{conf.title}</Dropdown.Button>
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
