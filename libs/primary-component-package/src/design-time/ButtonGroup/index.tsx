import styles from './index.module.less';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { Dropdown } from 'antd';

const ButtonGroup: React.FC<IDynamicComponentProps> = memo(props => {
  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const hostRef = useRef<HTMLDivElement>();
  // const ChildrenComponents = useMemo(() => {
  //   if (!conf.children || !conf.children.length) { return null; }
  //   return conf.children.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  // }, [conf.children]);

  const onMenuClick = () => {
    // console.log(`title:`,);
  };

  useEffect(() => {

    const editorActiveDetector = (() => {
      const host = hostRef.current;

      const activeComponent = () => {
        console.log(`active trigger`,);
      };

      const cancelActiveComponent = () => {
        console.log(`cancel active trigger`,);
      };

      return {
        observe() {
          host.addEventListener('active-component', activeComponent);
          host.addEventListener('cancel-active-component', cancelActiveComponent);
        },
        disconnect() {
          host.removeEventListener('active-component', activeComponent);
          host.removeEventListener('cancel-active-component', cancelActiveComponent);
        }
      };
    })();

    editorActiveDetector.observe();

    return () => {
      editorActiveDetector.disconnect();
    };
  }, []);

  return (
    <div className={styles['button-group']} ref={hostRef}>
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
