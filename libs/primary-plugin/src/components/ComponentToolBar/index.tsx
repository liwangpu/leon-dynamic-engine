import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { EditorStoreModel, IConfigurationManager, IProjectManager } from '@lowcode-engine/editor';
import { ToolBarMenu } from '../../enums';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import classnames from 'classnames';

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

  return (
    <div className={styles['toolbar']}>
      <Button className={
        classnames({
          [styles['hidden']]: !menus.delete
        })
      } type="primary" icon={<DeleteOutlined />} size='small' onClick={deleteComponent} />
    </div>
  );
});

ComponentToolBar.displayName = 'ComponentToolBar';

export default ComponentToolBar;