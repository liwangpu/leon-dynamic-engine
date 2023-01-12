import { IComponentConfiguration } from '@tiangong/core';
import React, { ComponentType, memo, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './index.module.less';
import { Empty } from 'antd';
import { EditorContext } from '../../contexts';
import { observer } from 'mobx-react-lite';
import * as _ from 'lodash';
import classnames from 'classnames';

export interface DynamicComponentSettingPanelProps {
  componentId: string;
};

const DynamicComponentSettingPanel: React.FC<DynamicComponentSettingPanelProps> = memo(observer(props => {

  const [panelLoaded, setPanelLoaded] = useState(false);
  const [unRegistryConfigPanel, setUnRegistryConfigPanel] = useState(false);
  const { store, componentDiscovery } = useContext(EditorContext);
  const componentType = store.treeStore.selectComponentType(props.componentId);
  const activeComponentId = store.interactionStore.activeComponentId;
  const Component = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const module = await componentDiscovery.loadComponentConfigurationModule(componentType, 'pc');
      if (module) {
        Component.current = ConfigPanelRenderWrapper(module.default);
        setPanelLoaded(true);
      } else {
        setUnRegistryConfigPanel(true);
      }
    })();
  }, []);

  return (
    <div className={
      classnames(
        styles['setting-panel-container'],
        {
          [styles['setting-panel-container--hidden']]: activeComponentId !== props.componentId
        }
      )
    } >
      {panelLoaded && <Component.current componentId={props.componentId} componentType={componentType} />}
      {unRegistryConfigPanel && <div className={styles['setting-panel-container__empty-placeholder']}>
        <Empty description='没有注册组件的配置面板' />
      </div>}
    </div >
  );
}));

DynamicComponentSettingPanel.displayName = 'DynamicComponentSettingPanel';

interface PanelWrapperProps {
  componentId: string;
  componentType: string;
};

// 配置面板容器
const ConfigPanelRenderWrapper = (ComponentSettingPanel: ComponentType<any>) => {

  const Wrapper: React.FC<PanelWrapperProps> = memo(observer(props => {

    const { store } = useContext(EditorContext);
    const configuration = store.configurationStore.selectComponentConfigurationWithoutChildren(props.componentId); // 不包含插槽等属性
    const configurationRef = useRef(configuration);
    useLayoutEffect(() => {
      // 深比较，判断是否相等
      if (!_.isEqual(configuration, configurationRef.current)) {
        configurationRef.current = configuration;
      }
    }, [configuration]);
    const valueChange = useCallback(_.debounce(config => {
      store.configurationStore.updateComponentConfiguration(config);
    }, 250), []);

    const onValueChange = useCallback((config: IComponentConfiguration) => {
      configurationRef.current = config;
      valueChange(config);
    }, [valueChange]);

    return (
      <ComponentSettingPanel value={configurationRef.current} onChange={onValueChange} />
    );
  }));

  return Wrapper;
};

DynamicComponentSettingPanel.displayName = 'DynamicComponentSettingPanel';

export default DynamicComponentSettingPanel;
