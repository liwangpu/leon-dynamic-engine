import React, { memo, useContext, useEffect, useMemo, useRef } from 'react';
import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { _Renderer } from '@tiangong/renderer';
import { EditorContext, PagePresentationUtilContext, PagePresentationUtilContextProvider } from '../../contexts';
import { DynamicComponentFactoryContext, IComponentConfiguration, IDynamicComponentFactory } from '@tiangong/core';
import { DynamicComponentCustomRenderer, DynamicComponent } from '../DynamicComponent';
import { filter } from 'rxjs/operators';
import { EventTopicEnum } from '../../enums';
import { SubSink } from 'subsink';
import Sortable from 'sortablejs';
import * as _ from 'lodash';

const COMPONENT_HOVER_DISABLED = 'editor-component-hover-disabled';
const COMPONENT_CONTAINER_DRAGGING = 'editor-dynamic-component-container--dragging';
const COMPONENT_HOVER_CLASSNAME = 'editor-dynamic-component--hover';

const componentFactory: IDynamicComponentFactory = {
  getDynamicComponentRenderFactory: () => {
    return DynamicComponent;
  },
  getDynamicComponentCustomRenderFactory: () => {
    return DynamicComponentCustomRenderer;
  }
};

const PagePresentation: React.FC = memo(observer(() => {

  const { store, event, dom, slot } = useContext(EditorContext);
  const presentationUtil = useMemo(() => new PagePresentationUtilContextProvider(), []);
  const schema = store.configurationStore.selectComponentConfigurationWithoutChildren(store.interactionStore.pageComponentId);
  const presentationRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const subs = new SubSink();
    const presentation = presentationRef.current;
    let lastHoveringComponentId: string;

    function getComponentSlotDoms(componentType: string): { matchedSlotDoms: Array<HTMLElement>, notMatchedSlotDoms: Array<HTMLElement> } {
      const matchedSlotProperties = slot.getMatchedSlotProperties(componentType);
      const matchedSlotDoms = dom.getComponentMatchedSlotDom(matchedSlotProperties);
      const allSlotDoms = dom.getAllComponentSlotDoms();
      const notMatchedSlotDoms = _.difference(allSlotDoms, matchedSlotDoms);
      return { matchedSlotDoms, notMatchedSlotDoms };
    }

    // 订阅组件拖拽事件,激活相应组件适配插槽
    subs.sink = event.message
      .pipe(filter(e => e.topic === EventTopicEnum.componentStartDragging || e.topic === EventTopicEnum.componentEndDragging))
      .pipe(filter(e => e.data))
      .subscribe(({ topic, data }: { topic: EventTopicEnum, data: IComponentConfiguration }) => {
        if (topic === EventTopicEnum.componentStartDragging) {
          // 隐藏组件激活边框
          presentation.classList.add(COMPONENT_HOVER_DISABLED);
          // 高亮组件适配插槽
          const { matchedSlotDoms, notMatchedSlotDoms } = getComponentSlotDoms(data.type);
          matchedSlotDoms.forEach(el => {
            el.classList.add(COMPONENT_CONTAINER_DRAGGING);
          });
          notMatchedSlotDoms.forEach(el => {
            const sortableInstance: Sortable = el['sortableInstance'];
            sortableInstance.option('disabled', true);
          });
        } else {
          presentation.classList.remove(COMPONENT_HOVER_DISABLED);
          const { matchedSlotDoms, notMatchedSlotDoms } = getComponentSlotDoms(data.type);
          matchedSlotDoms.forEach(el => {
            el.classList.remove(COMPONENT_CONTAINER_DRAGGING);
          });
          notMatchedSlotDoms.forEach(el => {
            const sortableInstance: Sortable = el['sortableInstance'];
            sortableInstance.option('disabled', false);
          });
        }
      });

    // 订阅组件hover事件,添加组件classname特效
    subs.sink = event.message
      .pipe(filter(e => e.topic === EventTopicEnum.componentHovering))
      .subscribe(({ data: componentId }: { data: string, topic: EventTopicEnum }) => {
        const lastDom = dom.getComponentDom(lastHoveringComponentId);
        if (lastDom) {
          lastDom.classList.remove(COMPONENT_HOVER_CLASSNAME);
        }
        const currentDom = dom.getComponentDom(componentId);
        if (currentDom) {
          currentDom.classList.add(COMPONENT_HOVER_CLASSNAME);
        }
        lastHoveringComponentId = componentId;
      });

    return () => {
      subs.unsubscribe();
    };
  }, []);

  return (
    <div className={styles['page-presentation']} ref={presentationRef}>
      <DynamicComponentFactoryContext.Provider value={componentFactory}>
        <PagePresentationUtilContext.Provider value={presentationUtil}>
          {schema && <_Renderer schema={schema} />}
          <div className={styles['page-presentation__util-container']}>
            <div id='component-drag-preview-node' className='hidden' ref={e => presentationUtil.setDragPreviewNode(e)}></div>
          </div>
        </PagePresentationUtilContext.Provider >
      </DynamicComponentFactoryContext.Provider>
    </div>
  );
}));

PagePresentation.displayName = 'PagePresentation';

export default PagePresentation;