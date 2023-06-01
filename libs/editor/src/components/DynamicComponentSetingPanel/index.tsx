import { IComponentConfiguration } from '@lowcode-engine/core';
import React, { ComponentType, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';
import { Empty } from 'antd';
import { ComponentSetterPanelContext, EditorContext, ISetterPanelContext } from '../../contexts';
import { observer } from 'mobx-react-lite';
import * as _ from 'lodash';
import classnames from 'classnames';

export interface DynamicComponentSettingPanelProps {
  componentId: string;
};

interface PanelWrapperProps {
  componentId: string;
  componentType: string;
};

const DynamicComponentSettingPanel: React.FC<DynamicComponentSettingPanelProps> = observer(props => {

  const [panelLoaded, setPanelLoaded] = useState(false);
  const [ConfigPanel, setConfigPanel] = useState<ComponentType<PanelWrapperProps>>();
  const { store, componentDiscovery } = useContext(EditorContext);
  const componentType = store.structure.selectComponentType(props.componentId);
  const activeComponentId = store.interaction.activeComponentId;

  useEffect(() => {
    (async () => {
      const module = await componentDiscovery.loadComponentConfigurationModule(componentType, 'pc');

      if (module) {
        setConfigPanel(ConfigPanelRenderWrapper(module.default));
        // 
      } else {
        setConfigPanel(null);
      }
      setPanelLoaded(true);
    })();
  }, [componentType]);

  return (
    <div className={
      classnames(
        styles['setting-panel-container'],
        {
          [styles['setting-panel-container--hidden']]: activeComponentId !== props.componentId
        }
      )
    } >
      {panelLoaded && <ConfigPanel componentId={props.componentId} componentType={componentType} />}
      {panelLoaded && !ConfigPanel && <div className={styles['setting-panel-container__empty-placeholder']}>
        <Empty description='没有注册组件的配置面板' />
      </div>}
    </div >
  );
});

DynamicComponentSettingPanel.displayName = 'DynamicComponentSettingPanel';

// 配置面板容器
const ConfigPanelRenderWrapper = (ComponentSettingPanel: ComponentType<any>) => {

  const Wrapper: React.FC<PanelWrapperProps> = observer(props => {

    const editorCtx = useContext(EditorContext);
    const conf = editorCtx.store.structure.selectComponentConfigurationWithoutChildren(props.componentId, true); // 不包含插槽等属性
    const parentType = editorCtx.store.structure.selectParentComponentType(props.componentId);
    const rootComponent = editorCtx.store.structure.selectRootComponent();
    const parentSlotProperty = editorCtx.store.structure.selectParentSlotProperty(props.componentId);
    const settingItemCxt = useMemo(() => {
      let ctx: ISetterPanelContext = {
        type: conf.type,
        parentType,
        slot: parentSlotProperty,
        rootType: rootComponent?.type,
      };
      return ctx;
    }, [conf.type, parentType, parentSlotProperty]);

    const configSelector = editorCtx.configuration.getConfigurationSelector(settingItemCxt);
    const value = _.isFunction(configSelector) ? _.cloneDeep(configSelector(editorCtx, conf)) : conf;

    const valueChange = useCallback(_.debounce(async c => {
      let current = { ...conf, ...c };
      editorCtx.configuration.updateComponent(current);
    }, 250), []);

    const onValueChange = useCallback((c: IComponentConfiguration) => {
      valueChange(c);
    }, [valueChange]);

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
