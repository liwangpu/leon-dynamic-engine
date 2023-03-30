import { GenerateComponentId, IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import React, { memo, useState, MouseEvent, useContext } from 'react';
import classnames from 'classnames';
import { ITabComponentConfiguration, ITabsComponentConfiguration } from '../../../models';
import styles from './index.module.less';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CommonSlot, ComponentTypes } from '../../../enums';
import { EditorContext } from '@lowcode-engine/editor';

const TabRenderOptions = {
  disableUIInteraction: true
};

const Tabs: React.FC<IDynamicComponentProps<ITabsComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const children = conf.children || [];
  const dynamicEngine = useDynamicComponentEngine();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const CustomRenderDynamicComponent = dynamicEngine.getCustomComponentRenderFactory();
  const [activeKey, setActiveKey] = useState<string>(conf.activeKey || children[0]?.id);
  const [tabLoadedMap, setTabLoadedMap] = useState<{ [key: string]: boolean }>({ [activeKey]: true });
  const isVertical = conf.direction === 'vertical';
  const { configuration } = useContext(EditorContext);

  const setTabLoadedState = (id: string) => {
    setTabLoadedMap(prev => ({
      ...prev,
      [id]: true,
    }));
  };

  const activeTab = (item) => {
    const { id } = item;
    setActiveKey(id);
    setTabLoadedState(id);
  };

  const addTab = async (e: MouseEvent) => {
    e.stopPropagation();
    const id = GenerateComponentId(ComponentTypes.tab);
    const tabConf: ITabComponentConfiguration = {
      id,
      type: ComponentTypes.tab,
      title: '页签项',
    };
    setActiveKey(id);
    setTabLoadedMap(prev => ({
      ...prev,
      [id]: true,
    }));
    await configuration.addComponent(tabConf, conf.id, children.length, CommonSlot.children);
    configuration.activeComponent(tabConf.id);
  };

  const renderNavs = () => {
    return (
      <div
        className={styles['navs']}
        data-dynamic-component-container='children'
        data-dynamic-container-direction='horizontal'
        data-dynamic-container-owner={conf.id}
        data-dynamic-container-drop-only="true"
      >
        {children.map((tabCfg, index) => {
          const { id, title } = tabCfg;
          return (
            <CustomRenderDynamicComponent configuration={tabCfg} key={id}>
              <div className={classnames(
                styles['nav'],
                {
                  [styles['nav--active']]: id === activeKey
                }
              )}
                onClick={() => activeTab(tabCfg, index)}
                title={title}
              >
                <p className={styles['nav__title']}>{title}</p>
              </div>
            </CustomRenderDynamicComponent>
          );

        })}
      </div>
    );
  };

  const renderTabsContent = () => {
    return children.map((tabCfg) => {
      const { id } = tabCfg;
      return tabLoadedMap[id] ? (
        <div
          key={id}
          className={classnames(
            styles['tab-container'],
            {
              [styles['tab-container--active']]: activeKey === id
            }
          )}
        >
          <DynamicComponent configuration={tabCfg} options={TabRenderOptions} />
        </div>
      ) : null;
    });
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
        {renderTabsContent()}
      </div>
    </div>
  );
});

Tabs.displayName = 'Tabs';

export default Tabs;