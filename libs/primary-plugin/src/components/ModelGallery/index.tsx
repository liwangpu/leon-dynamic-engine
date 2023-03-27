import styles from './index.module.less';
import React, { memo, useCallback, useRef, useState } from 'react';
import { CaretDownOutlined, FolderOpenFilled, FontColorsOutlined, TagOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import Sortable from 'sortablejs';
import { IComponentConfiguration } from '@lowcode-engine/core';
import Tree from 'rc-tree';
import classnames from 'classnames';
import 'rc-tree/assets/index.css';
import { DataNode } from 'rc-tree/lib/interface';
import { INotification } from '../../models';
import * as _ from 'lodash';
import { EventTopicEnum } from '@lowcode-engine/editor';
import GalleryHeader from '../GalleryHeader';

enum FolderCategory {
  field = 'field',
  relation = 'relation'
}

export interface IBusinessField {
  id: string;
  name: string;
  code: string;
  fieldType?: string;
}

export interface IBusinessModel extends IBusinessField {
  fields?: Array<IBusinessField>;
  relations?: Array<IBusinessModel>;
}

export interface IModelLoader {
  (id: string): Promise<IBusinessModel>
}

export interface IConfigurationTransfer {
  (data: IBusinessField | IBusinessModel): Promise<IComponentConfiguration>;
}

export interface IModelGalleryProps {
  mainModelId: string;
  modelLoader: IModelLoader;
  configurationTransfer: IConfigurationTransfer;
  notification?: INotification;
}

const NodeIcon: React.FC<{ data: { isObjectNode?: boolean; fieldType?: string; folderCategory?: FolderCategory } }> = memo((props) => {
  const { isObjectNode, folderCategory, fieldType } = props.data;

  if (isObjectNode) {
    return <TagOutlined />;
  }

  if (folderCategory) {
    return <FolderOpenFilled />;
  }

  if (fieldType) {
    return <FontColorsOutlined />;
  }
  return (
    <div></div>
  );
});

NodeIcon.displayName = 'NodeIcon';

const SwitchIcon: React.FC<{ folded?: boolean }> = memo(({ folded }) => {
  return (
    <div className={classnames(
      styles['switch-icon'],
      {
        [styles['switch-icon--folded']]: folded
      }
    )}>
      <CaretDownOutlined />
    </div>
  );
});

SwitchIcon.displayName = 'SwitchIcon';

const TitleNode: React.FC<{ field: IBusinessField; configurationTransfer: IConfigurationTransfer, notification?: INotification }> = memo(({ field, configurationTransfer, notification }) => {

  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    let currentConf: IComponentConfiguration | null;
    const instance = Sortable.create(ref.current, {
      group: {
        name: 'dynamic-component',
        pull: 'clone',
        put: false
      },
      sort: false,
      dropBubble: false,
      dragoverBubble: false,
      ghostClass: "editor-sortable-ghost",
      scroll: false,
      bubbleScroll: false,
      swapThreshold: 0.65,
      setData: async (dataTransfer, dragEl: HTMLElement) => {
        const conf = await configurationTransfer(field);
        if (!conf) { return; }
        dataTransfer.setData('Text', JSON.stringify(conf));
        currentConf = conf;
      },
      onStart: (evt: Sortable.SortableEvent) => {
        if (_.isFunction(notification)) {
          notification(EventTopicEnum.componentStartDragging, { ...currentConf });
        }
        const itemEl = evt.item;
        itemEl.classList.add('dragging');
      },
      onEnd: (evt: Sortable.SortableEvent) => {
        if (_.isFunction(notification)) {
          notification(EventTopicEnum.componentEndDragging, { ...currentConf });
        }
        currentConf = null;
        if (evt.from === evt.to) { return; }
        const el: HTMLElement = evt.item as any;
        el.parentElement!.removeChild(el);
      }
    });
    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <div className={styles['field-node']} ref={ref}>
      <div className={classnames(
        styles['dynamic-component-field'],
        'editor-dynamic-component',
        'editor-dynamic-component--preview',
      )}>
        <span>{field.name}</span>
        <div className='dragdrop-placeholder-flag'></div>
      </div>
    </div>
  );
});

TitleNode.displayName = 'TitleNode';

interface ITreeNode extends DataNode {
  folderCategory?: FolderCategory;
  isObjectNode?: boolean;

}

export const ModelGallery: React.FC<IModelGalleryProps> = memo(({ mainModelId, modelLoader, configurationTransfer, notification }) => {

  const [treeData, setTreeData] = useState<Array<any>>([]);
  const [expandedKeys, setExpandedKeys] = useState<Array<string>>([]);
  const switcherIcon = obj => {

    if (obj.isLeaf) {
      return null;
    }

    return (
      <SwitchIcon folded={!obj.expanded} />
    );
  };

  const onLoadData = async treeNode => {
    if (treeNode.children) {
      return;
    }
    const model = await modelLoader(treeNode.key);
    try {
      const trNode = treeNodeTransfer(model);
      let newTreeData = [...treeData];
      setTreeNode(newTreeData, treeNode.key, trNode.children as any);
      setTreeData(newTreeData);
    } catch (error) {
      console.log(`err:`, error);
    }
  };

  const setTreeNode = (trData: Array<any>, curKey: string, children: Array<any>) => {
    const loop = (data: Array<any>) => {
      if (!data?.length) { return; }
      data.forEach(item => {
        if (item.key === curKey) {
          item.children = children;
        } else {
          loop(item.children);
        }
      });
    };
    loop(trData);
  };

  const treeNodeTransfer = useCallback((model: IBusinessModel) => {
    const treeNode: ITreeNode = {
      key: model.id,
      title: model.name,
      isObjectNode: true,
      className: 'object_node',
      isLeaf: false,
      children: [
      ]
    };

    const fieldCategoryNode: ITreeNode = {
      key: `${model.id}_fields`,
      title: '字段',
      folderCategory: FolderCategory.field,
      className: styles['field-category-node'],
    };

    if (model.fields && model.fields.length) {
      fieldCategoryNode['children'] = model.fields.map(f => ({
        key: f.id,
        title: (<TitleNode field={f} configurationTransfer={configurationTransfer} notification={notification} />),
        fieldType: f.fieldType,
        isLeaf: true,
      }));
    }
    treeNode.children.push(fieldCategoryNode as any);

    if (model.relations && model.relations.length) {
      const relationCategoryNode: ITreeNode = {
        key: `${model.id}_relations`,
        title: '相关对象',
        folderCategory: FolderCategory.relation,
        className: styles['relation-category-node'],
        isLeaf: false,
        children: model.relations?.map(r => ({
          key: r.id,
          title: r.name,
          isObjectNode: true,
          className: 'object_node',
          isLeaf: false,
        }))
      };
      treeNode.children.push(relationCategoryNode);
    }

    return treeNode;
  }, []);

  useEffect(() => {
    if (mainModelId) {
      (async () => {
        const model = await modelLoader(mainModelId);
        const treeNode = treeNodeTransfer(model);
        setExpandedKeys([mainModelId, `${mainModelId}_fields`, `${mainModelId}_relations`]);
        setTreeData([treeNode]);
      })();
    }
  }, []);

  return (
    <div className={styles['model-gallery']}>
      <GalleryHeader title='模型' />
      <div className={styles['field-panel']}>
        {treeData.length && (
          <Tree
            className="model-gallery-tree"
            showLine={true}
            showIcon={false}
            icon={ps => (<NodeIcon data={ps.data as any} />)}
            treeData={treeData}
            switcherIcon={switcherIcon}
            selectable={false}
            defaultExpandedKeys={expandedKeys}
            loadData={onLoadData}
          />
        )}
      </div>
    </div>
  );
});

ModelGallery.displayName = 'ModelGallery';
