import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { memo } from 'react';
import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Tree } from 'antd';
import { useEffect } from 'react';
import Sortable from 'sortablejs';
import { useMemo } from 'react';
import { EventTopicEnum, IEventManager } from '@lowcode-engine/editor';
import { IComponentConfiguration } from '@lowcode-engine/core';

export interface IModelFieldNode {
  key: string;
  type: string;
  title: string;
  children?: Array<IModelFieldNode>;
}

export interface IModelGalleryProps {
  event: IEventManager;
  fieldNodes: Array<IModelFieldNode>;
  configurationTransfer: (key: string) => Promise<IComponentConfiguration>;
}

const ModelGallery: React.FC<IModelGalleryProps> = memo(observer(props => {

  const fieldNodeMap = useMemo(() => (new Map<string, HTMLDivElement>()), []);

  useEffect(() => {
    const sortableInstances: Sortable[] = [];

    fieldNodeMap.forEach((node) => {
      // 在onStart的时候无法通过dataTransfer获取当前操作的配置信息,所有暂时先用这个方法
      let currentConf: IComponentConfiguration | null;
      const instance = Sortable.create(node, {
        group: {
          name: 'dynamic-component',
          pull: 'clone',
          put: false
        },
        sort: false,
        setData: async (dataTransfer, dragEl: HTMLElement) => {
          const key = dragEl.getAttribute('data-field-key');
          const conf = await props.configurationTransfer(key);
          if (!conf) { return; }
          dataTransfer.setData('Text', JSON.stringify(conf));
          currentConf = conf;
        },
        onStart: (evt: Sortable.SortableEvent) => {
          props.event.emit(EventTopicEnum.componentStartDragging, currentConf);
          const itemEl = evt.item;
          itemEl.classList.add('dragging');
        },
        onEnd: (evt: Sortable.SortableEvent) => {
          props.event.emit(EventTopicEnum.componentEndDragging, { ...currentConf });
          currentConf = null;
          if (evt.from === evt.to) { return; }
          const el: HTMLElement = evt.item as any;
          el.parentElement!.removeChild(el);
        }
      });
      sortableInstances.push(instance);
    });
    return () => {
      sortableInstances.forEach(ins => ins.destroy());
    };
  }, []);

  const registerFieldRef = (field: string, node: HTMLDivElement) => {
    if (!node) { return; }
    fieldNodeMap.set(field, node);
  };

  return (
    <div className={styles['model-gallery']}>
      <div className={styles['content-panel-header']}>
        <p className={styles['content-panel-header__title']}>模型</p>
        <div className={styles['field-panel']}>
          <Tree
            showLine={true}
            defaultExpandAll={true}
            selectable={false}
            switcherIcon={<DownOutlined />}
            icon={false}
            treeData={props.fieldNodes as any}
            titleRender={nodeData => (
              <div className='business-field-item' ref={e => registerFieldRef(nodeData.key as string, e)}>
                <div className='' title={nodeData.title as string} data-field-key={nodeData.key} >
                  <span>{nodeData.title as any}</span>
                  <div className='dragdrop-placeholder-flag'></div>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}));

ModelGallery.displayName = 'ModelGallery';

export default ModelGallery;