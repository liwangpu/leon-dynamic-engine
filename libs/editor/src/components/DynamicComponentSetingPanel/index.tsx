import { IComponentConfiguration } from '@lowcode-engine/core';
import React, { ComponentType, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.module.less';
import { Empty } from 'antd';
import { ComponentSetterPanelContext, EditorContext, ISetterPanelContext } from '../../contexts';
import { observer } from 'mobx-react-lite';
import * as _ from 'lodash';
import classnames from 'classnames';
import { toJS } from 'mobx';

export interface DynamicComponentSettingPanelProps {
  componentId: string;
};

const DynamicComponentSettingPanel: React.FC<DynamicComponentSettingPanelProps> = observer(props => {

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
});

DynamicComponentSettingPanel.displayName = 'DynamicComponentSettingPanel';

interface PanelWrapperProps {
  componentId: string;
  componentType: string;
};

// 配置面板容器
const ConfigPanelRenderWrapper = (ComponentSettingPanel: ComponentType<any>) => {

  const Wrapper: React.FC<PanelWrapperProps> = observer(props => {

    const editorCtx = useContext(EditorContext);
    const conf = editorCtx.store.configurationStore.selectComponentConfigurationWithoutChildren(props.componentId, true); // 不包含插槽等属性
    const parentType = editorCtx.store.treeStore.selectParentComponentType(props.componentId);
    const parentSlotProperty = editorCtx.store.treeStore.selectParentSlotProperty(props.componentId);
    const settingItemCxt = useMemo(() => {
      let ctx: ISetterPanelContext = {
        type: conf.type,
        parentType,
        slot: parentSlotProperty
      };
      return ctx;
    }, [conf.type, parentType, parentSlotProperty]);

    const configSelector = editorCtx.configuration.getConfigurationSelector(settingItemCxt);
    const value = _.isFunction(configSelector) ? _.cloneDeep(configSelector(editorCtx, conf)) : conf;

    const valueChange = useCallback(_.debounce(c => {
      const current = { ...conf, ...c };
      console.log(`current:`, current);
      editorCtx.configuration.updateComponent(current);
    }, 250), []);

    const onValueChange = useCallback((c: IComponentConfiguration) => {
      valueChange(c);
    }, [valueChange]);

    console.log(`initVal:`, value);

    return (
      <ComponentSetterPanelContext.Provider value={settingItemCxt}>
        <ComponentSettingPanel value={value} parentType={parentType} onChange={onValueChange} />
      </ComponentSetterPanelContext.Provider>
    );
  });
  Wrapper.displayName = 'ConfigPanelRenderWrapper';
  return Wrapper;
};


export default DynamicComponentSettingPanel;
