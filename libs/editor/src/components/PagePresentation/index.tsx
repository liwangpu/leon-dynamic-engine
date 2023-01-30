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
import { ComponentToolBarWrapper } from '../ComponentToolBar';

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

  const { event, dom, slot } = useContext(EditorContext);
  const presentationUtil = useMemo(() => new PagePresentationUtilContextProvider(), []);
  const presentationRef = useRef<HTMLDivElement>();
  // const toolbarRef = React.createRef<HTMLDivElement>();
  // const toolbar = useMemo<IComponentToolBarContext>(() => {
  //   let latestActiveComponentId: string = null;

  //   const calculateToolBarPosition = (componentId: string) => {
  //     const toolbarHost = toolbarRef.current;
  //     const componentHost = dom.getComponentHost(componentId);
  //     if (!componentHost || !toolbarHost) { return; }
  //     let rect = componentHost.getBoundingClientRect();
  //     // toolbarHost.style.width = `${rect.width}px`;
  //     // toolbarHost.style.height = `${rect.height}px`;
  //     toolbarHost.style.top = `${rect.top - 32}px`;
  //     toolbarHost.style.left = `${rect.left + rect.width - 160}px`;
  //   };
  //   const componentIntersecting = new Map<string, boolean>();

  //   return {
  //     active(id: string) {
  //       // calculateToolBarPosition(id);
  //       latestActiveComponentId = id;
  //       this.toggleStatus(true);
  //     },
  //     toggleStatus(enabled: boolean) {
  //       if (!toolbarRef.current) { return; }
  //       // console.log(`componentIntersecting:`, componentIntersecting);
  //       if (enabled) {
  //         if (!componentIntersecting.has(latestActiveComponentId) || componentIntersecting.get(latestActiveComponentId)) {
  //           this.reposition();
  //           toolbarRef.current.classList.add('show');
  //         } else {
  //           toolbarRef.current.classList.remove('show');
  //         }
  //       } else {
  //         toolbarRef.current.classList.remove('show');
  //       }
  //     },
  //     reposition() {
  //       calculateToolBarPosition(latestActiveComponentId);
  //     },
  //     setIntersecting(componentId, intersecting) {
  //       componentIntersecting.set(componentId, intersecting);
  //     },
  //   };
  // }, []);

  useEffect(() => {
    const subs = new SubSink();
    const presentation = presentationRef.current;
    let lastHoveringComponentId: string;

    function getComponentSlotDoms(componentType: string): { matchedSlotDoms: Array<HTMLElement>, notMatchedSlotDoms: Array<HTMLElement> } {
      const matchedSlotProperties = slot.getMatchedSlotProperties(componentType);
      const matchedSlotDoms = dom.getComponentMatchedSlotHost(matchedSlotProperties);
      const allSlotDoms = dom.getAllComponentSlotHosts();
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
        const lastDom = dom.getComponentHost(lastHoveringComponentId);
        if (lastDom) {
          lastDom.classList.remove(COMPONENT_HOVER_CLASSNAME);
        }
        const currentDom = dom.getComponentHost(componentId);
        if (currentDom) {
          currentDom.classList.add(COMPONENT_HOVER_CLASSNAME);
        }
        lastHoveringComponentId = componentId;
      });

    return () => {
      subs.unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   let lastResizeAt = Date.now();
  //   let resizeTimeout = null;
  //   let isFirst = true;
  //   const scrollDetecting = () => {
  //     if (isFirst) {
  //       isFirst = false;
  //       return;
  //     }
  //     if (Date.now() - lastResizeAt > 100) {
  //       toolbar.toggleStatus(false);
  //     }

  //     lastResizeAt = Date.now()
  //     if (resizeTimeout) {
  //       clearTimeout(resizeTimeout);
  //     }

  //     resizeTimeout = setTimeout(function () {
  //       if (Date.now() - lastResizeAt > 99) {
  //         toolbar.toggleStatus(true);
  //       }
  //     }, 100);
  //   }

  //   const resizeObs = new ResizeObserver(() => {
  //     scrollDetecting();
  //   });

  //   resizeObs.observe(presentationRef.current);
  //   return () => {
  //     resizeObs.disconnect();
  //     // disposer();
  //     // subscription.unsubscribe();
  //   };
  // }, []);

  return (
    <div className={styles['page-presentation']} ref={presentationRef}>
      <DynamicComponentFactoryContext.Provider value={componentFactory}>
        <PagePresentationUtilContext.Provider value={presentationUtil}>
            <RendererImplement />
            <ComponentToolBarWrapper />
            <div className={styles['page-presentation__util-container']}>
              <div id='component-drag-preview-node' className='hidden' ref={e => presentationUtil.setDragPreviewNode(e)}></div>
            </div>
        </PagePresentationUtilContext.Provider >
      </DynamicComponentFactoryContext.Provider>
    </div>
  );
}));

PagePresentation.displayName = 'PagePresentation';

const RendererImplement: React.FC = memo(observer(() => {
  const { store } = useContext(EditorContext);
  const schema = store.configurationStore.selectComponentConfigurationWithoutChildren(store.interactionStore.pageComponentId);

  return (
    <_Renderer schema={schema} />
  );
}));

RendererImplement.displayName = 'RendererImplement';

export default PagePresentation;