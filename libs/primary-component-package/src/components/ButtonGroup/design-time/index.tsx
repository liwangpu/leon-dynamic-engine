import styles from './index.module.less';
import React, { memo, useLayoutEffect, useRef } from 'react';
import { IDynamicComponentContainerRendererRef, IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { Dropdown } from 'antd';
import { CommonSlot } from '../../../enums';
import { IButtonComponentConfiguration, IButtonGroupComponentConfiguration } from '../../../models';

const ButtonGroup: React.FC<IDynamicComponentProps<IButtonGroupComponentConfiguration>> = memo(props => {
  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentFactory();
  const DynamicComponentContainer = dynamicEngine.getDynamicComponentContainerFactory();
  const hostRef = useRef<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement>();
  const groupChildrenContainerRef = useRef<IDynamicComponentContainerRendererRef>();

  useLayoutEffect(() => {
    const editorActiveDetector = (() => {
      const host = hostRef.current;
      const content = contentRef.current;
      const groupChildrenContainer = groupChildrenContainerRef.current.getContainerRef();

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

        const evt = new CustomEvent('editor-event:component-container-unique', { bubbles: true, detail: { slots: [groupChildrenContainerRef.current.getContainerRef()] } });
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
        <DynamicComponentContainer
          className={styles['button-container']}
          configuration={conf}
          slot={CommonSlot.children}
          ref={groupChildrenContainerRef}
        >
          {(cs: Array<IButtonComponentConfiguration>) => {
            return cs.map(c => (
              <DynamicComponent key={c.id} configuration={c}>
                <div className={styles['sub-button']}>
                  <p className={styles['sub-button__title']}>{c.title}</p>
                </div>
              </DynamicComponent>
            ));
          }}
        </DynamicComponentContainer>
      </div>
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
