import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { EditorStoreModel, IConfigurationManager } from '@lowcode-engine/editor';
import { ToolBarMenu } from '../../enums';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { ComponentDiscoveryContext } from '@lowcode-engine/core';

export interface IComponentToolBarMap {
  [componentType: string]: Array<ToolBarMenu>;
}


export interface IComponentToolBarProps {
  store: EditorStoreModel;
  configuration: IConfigurationManager;
  toolBarMap: IComponentToolBarMap;
}

const ComponentToolBar: React.FC<IComponentToolBarProps> = observer(({ store, toolBarMap, configuration }) => {
  const componentId = store.interactionStore.activeComponentId;
  const componentType = store.treeStore.selectComponentType(componentId);
  const componentDiscovery = useContext(ComponentDiscoveryContext);
  const [componentTitle, setComponentTitle] = useState<string>();

  const menus = useMemo(() => {
    const arr = toolBarMap[componentType] || [ToolBarMenu.delete];
    const set = new Set(arr);
    return {
      delete: set.has(ToolBarMenu.delete)
    };
  }, [componentType]);

  const deleteComponent = () => {
    configuration.deleteComponent(componentId);
  };

  useEffect(() => {
    if (!componentType) { return; }
    (async () => {
      const cs = await componentDiscovery.queryComponentDescriptions();
      const c = cs.find(c => c.type === componentType);
      setComponentTitle(c ? c.title : '未定义');
    })();
  }, [componentType]);

  return (
    <div className={styles['toolbar']}>
      <Button className={
        classnames(
          styles['toolbar-button'],
          {
            [styles['hidden']]: !menus.delete
          })
      } type="primary" icon={<DeleteOutlined />} size='small' onClick={deleteComponent} />

      <p className={styles["component-title"]}>{componentTitle}</p>
    </div>
  );
});

ComponentToolBar.displayName = 'ComponentToolBar';

export default ComponentToolBar;