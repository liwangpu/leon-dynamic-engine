import styles from './index.module.less';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import Sortable from 'sortablejs';
import classnames from 'classnames';
import { UpOutlined } from '@ant-design/icons';
import { IComponentConfiguration, IComponentDescription } from '@lowcode-engine/core';
import { EventTopicEnum } from '@lowcode-engine/editor';
import { INotification } from '../../models';
import * as _ from 'lodash';
import GalleryHeader from '../GalleryHeader';

export type ComponentGroup = {
  title: string;
  components: IComponentDescription[];
}

export interface OptionalComponentPanelProps {
  groups: Array<ComponentGroup>;
  notification?: INotification;
}

export const ComponentGallery: React.FC<OptionalComponentPanelProps> = memo(props => {

  const [componentGroupFoldedState, setComponentGroupFoldedState] = useState<{ [key: string]: boolean }>({});
  const optionalGroupContainerEl = useRef(null);

  useEffect(() => {
    listenComponentDragging();
  }, []);

  const toggleComponentGroupFoldedState = (title: string) => {
    setComponentGroupFoldedState({ ...componentGroupFoldedState, [title]: !componentGroupFoldedState[title] });
  };

  const listenComponentDragging = useCallback(() => {
    const containerEl: HTMLElement = optionalGroupContainerEl.current as any;
    const componentEls = containerEl.querySelectorAll('.optional-component');
    const sortableInstances: Sortable[] = [];
    componentEls.forEach(ce => {
      // 在onStart的时候无法通过dataTransfer获取当前操作的配置信息,所有暂时先用这个方法
      let currentConf: IComponentConfiguration | null;
      const instance = Sortable.create(ce.parentElement as any, {
        group: {
          name: 'dynamic-component',
          pull: 'clone',
          put: false
        },
        sort: false,
        ghostClass: "editor-sortable-ghost",
        setData: async (dataTransfer, dragEl: HTMLElement) => {
          let data = { type: dragEl.getAttribute('data-type'), title: dragEl.getAttribute('title') };
          dataTransfer.setData('Text', JSON.stringify(data));
          currentConf = data as any;
        },
        onStart: (evt: Sortable.SortableEvent) => {
          if (_.isFunction(props.notification)) {
            props.notification(EventTopicEnum.componentStartDragging, { ...currentConf });
          }
          const itemEl = evt.item;
          itemEl.classList.add('dragging');
        },
        onEnd: (evt: Sortable.SortableEvent) => {
          if (_.isFunction(props.notification)) {
            props.notification(EventTopicEnum.componentEndDragging, { ...currentConf });
          }
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

  const OptionalGroups = props.groups.map(group => (
    <div className={styles['component-group']} key={group.title}>
      <div className={classnames(
        styles['component-group__folder']
      )} onClick={() => toggleComponentGroupFoldedState(group.title)}>
        <p className={styles['component-group__title']}>{group.title}</p>
        <UpOutlined className={classnames(
          styles['component-group__icon'],
          {
            [styles['component-group__icon--folded']]: componentGroupFoldedState[group.title]
          }
        )} />
      </div>
      <div className={classnames(
        styles['component-group__component-list'],
        {
          [styles['component-group__component-list--folded']]: componentGroupFoldedState[group.title]
        }
      )}>
        {group.components.map(c => (
          <div className={classnames(
            styles['optional-component'],
            'optional-component'
          )} key={c.type} title={c.title} data-type={c.type}>
            <p className={styles['optional-component__title']}>{c.title}</p>
            <div className='dragdrop-placeholder-flag'></div>
          </div>
        ))}
      </div>
    </div >
  ));

  return (
    <div className={styles['optional-component-panel']}>
      <GalleryHeader title='组件库' />
      <div className={styles['optional-list']} ref={optionalGroupContainerEl}>
        {OptionalGroups}
      </div>
    </div>
  );
});

ComponentGallery.displayName = 'ComponentGallery';
