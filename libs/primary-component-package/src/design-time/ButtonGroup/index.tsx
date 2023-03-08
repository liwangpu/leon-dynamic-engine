import styles from './index.module.less';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { Dropdown } from 'antd';

const ButtonGroup: React.FC<IDynamicComponentProps> = memo(props => {
  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const hostRef = useRef<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement>();
  const ChildrenComponents = useMemo(() => {
    if (!conf.children || !conf.children.length) { return null; }
    return conf.children.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.children]);

  const onMenuClick = () => {
    // console.log(`title:`,);
  };

  useEffect(() => {

    const editorActiveDetector = (() => {
      const host = hostRef.current;
      const content = contentRef.current;

      const activeComponent = () => {
        let rect = host.getBoundingClientRect();
        content.style.display = 'flex';
        content.style.top = `${rect.bottom}px`;
        content.style.left = `${rect.left}px`;
        console.log(`active trigger:`, rect);
      };

      const cancelActiveComponent = () => {
        console.log(`cancel active trigger`,);
        content.style.display = 'none';
      };

      return {
        observe() {
          host.addEventListener('editor-event:active-component', activeComponent);
          host.addEventListener('editor-event:cancel-active-component', cancelActiveComponent);
        },
        disconnect() {
          host.removeEventListener('editor-event:active-component', activeComponent);
          host.removeEventListener('editor-event:cancel-active-component', cancelActiveComponent);
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

      <div className={styles['button-group__event-blocker']} onClick={onMenuClick}></div>
      <Dropdown.Button menu={{ items: [] }} size='small'>{conf.title}</Dropdown.Button>

      <div className={styles['button-group__content']} ref={contentRef}>
        <div className={styles['button-container']} data-dynamic-component-container='children' data-dynamic-container-owner={conf.id}>
          {ChildrenComponents}
        </div>
      </div>
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
