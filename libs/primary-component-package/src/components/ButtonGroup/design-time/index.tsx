import styles from './index.module.less';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { Dropdown } from 'antd';

const ButtonGroup: React.FC<IDynamicComponentProps> = memo(props => {
  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const CustomRenderDynamicComponent = dynamicEngine.getCustomComponentRenderFactory();
  const hostRef = useRef<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement>();
  const groupChildrenContainerRef = useRef<HTMLDivElement>();
  const ChildrenComponents = useMemo(() => {
    if (!conf.children || !conf.children.length) { return null; }

    return conf.children.map(c => (
      <CustomRenderDynamicComponent configuration={c} key={c.id}>
        <div className={styles['sub-button']}>
          <p className={styles['sub-button__title']}>{c.title}</p>
        </div>
      </CustomRenderDynamicComponent>
    ));
  }, [conf.children]);

  useEffect(() => {

    const editorActiveDetector = (() => {
      const host = hostRef.current;
      const content = contentRef.current;
      const groupChildrenContainer = groupChildrenContainerRef.current;

      let cancelActiveHandler: NodeJS.Timeout;

      const activeComponent = () => {
        if (cancelActiveHandler) {
          clearTimeout(cancelActiveHandler);
          cancelActiveHandler = null;
        }
        const rect = host.getBoundingClientRect();
        content.style.display = 'flex';
        content.style.top = `${rect.bottom}px`;
        content.style.left = `${rect.left - (120 - rect.width)}px`;

        const evt = new CustomEvent('editor-event:component-container-unique', { bubbles: true, detail: { slots: [groupChildrenContainerRef.current] } });
        groupChildrenContainer.dispatchEvent(evt);
      };

      const cancelActiveComponent = () => {
        const evt = new CustomEvent('editor-event:cancel-component-container-unique', { bubbles: true });
        groupChildrenContainer.dispatchEvent(evt);
        cancelActiveHandler = setTimeout(() => {
          content.style.display = 'none';
        }, 80);
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

      <div className={styles['button-group__event-blocker']} ></div>
      <Dropdown.Button menu={{ items: [] }} size='small'>{conf.title}</Dropdown.Button>

      <div className={styles['button-group__content']} ref={contentRef}>
        <div className={styles['button-container']} data-dynamic-component-container='children' data-dynamic-container-owner={conf.id} ref={groupChildrenContainerRef}>
          {ChildrenComponents}
        </div>
      </div>
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
