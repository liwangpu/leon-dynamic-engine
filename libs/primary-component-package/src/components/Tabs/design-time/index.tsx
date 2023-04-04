import { GenerateComponentId, IDynamicComponentContainerRef, IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import React, { memo, useState, MouseEvent, useContext, useRef, useMemo } from 'react';
import classnames from 'classnames';
import { ITabComponentConfiguration, ITabsComponentConfiguration } from '../../../models';
import styles from './index.module.less';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CommonSlot, ComponentTypes } from '../../../enums';
import { EditorContext } from '@lowcode-engine/editor';

const Tabs: React.FC<IDynamicComponentProps<ITabsComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const children = conf.children || [];
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const DynamicComponentContainer = dynamicEngine.getDynamicComponentContainerRenderFactory();
  const [activeTabId, setActiveTabId] = useState<string>(conf.defaultActiveTab || children[0]?.id);
  const tabNavsContainerRef = useRef<IDynamicComponentContainerRef>();
  const isVertical = conf.direction !== 'horizontal';
  const { configuration } = useContext(EditorContext);

  const activeTabConf = useMemo(() => {
    return {
      id: activeTabId
    };
  }, [activeTabId]);

  const activeTab = (tab: ITabComponentConfiguration) => {
    setActiveTabId(tab.id);
  };

  const addTab = async (e: MouseEvent) => {
    e.stopPropagation();
    const id = GenerateComponentId(ComponentTypes.tab);
    const tabConf: ITabComponentConfiguration = {
      id,
      type: ComponentTypes.tab,
      title: `页签 ${children.length + 1}`,
    };
    await configuration.addComponent(tabConf, conf.id, children.length, CommonSlot.children);
    configuration.activeComponent(tabConf.id);
    setTimeout(() => {
      setActiveTabId(id);
      tabNavsContainerRef.current.scrollToEnd();
    }, 80);
  };

  const renderNavs = () => {
    return (
      <DynamicComponentContainer
        className={styles['navs']}
        configuration={conf}
        slot={CommonSlot.children}
        direction={isVertical ? 'vertical' : 'horizontal'}
        ref={tabNavsContainerRef}
      >
        {(cs: Array<ITabComponentConfiguration>) => cs.map(c => {
          return (
            <DynamicComponent configuration={c} key={c.id}>
              <div className={classnames(
                styles['nav'],
                {
                  [styles['nav--active']]: c.id === activeTabId
                }
              )}
                onClick={() => activeTab(c)}
                title={c.title}
              >
                <p className={styles['nav__title']}>{c.title}</p>
              </div>
            </DynamicComponent>
          );

        })}
      </DynamicComponentContainer>
    );
  };

  const renderTabContent = () => {
    return (
      <DynamicComponentContainer
        className={styles['tab-container']}
        configuration={activeTabConf}
        slot={CommonSlot.children}
      />
    );
  };

  return (
    <div className={classnames(
      styles['tabs'],
      {
        [styles['vertical-tabs-theme']]: isVertical
      }
    )}>
      <div className={styles['tabs__header']}>
        {renderNavs()}
        <div className={styles['tabs__toolbar']}>
          <Button
            size='small'
            type="text"
            icon={<PlusOutlined />}
            onClick={addTab}
          />
        </div>
      </div>
      <div className={styles['tabs__content']}>
        {renderTabContent()}
      </div>
    </div>
  );
});

Tabs.displayName = 'Tabs';

export default Tabs;