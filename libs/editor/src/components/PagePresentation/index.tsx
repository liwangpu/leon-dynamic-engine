import React, { useContext, useEffect, useMemo, useRef } from 'react';
import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { _Renderer } from '@lowcode-engine/renderer';
import { EditorContext, PagePresentationUtilContext, PagePresentationUtilContextProvider } from '../../contexts';
import { DynamicComponentFactoryContext, IComponentConfiguration, IDynamicComponentFactory } from '@lowcode-engine/core';
import { DynamicComponentCustomRenderer, DynamicComponent } from '../DynamicComponent';
import { filter, first, map } from 'rxjs/operators';
import { EventTopicEnum } from '../../enums';
import { SubSink } from 'subsink';
import Sortable from 'sortablejs';
import * as _ from 'lodash';
import { ComponentToolBarWrapper } from '../ComponentToolBar';

const DISABLE_COMPONENT_UI_EFFECT = 'disable-component-ui-effect';
const COMPONENT_CONTAINER_DRAGGING = 'editor-dynamic-component-container--dragging';
const COMPONENT_HOVER = 'editor-dynamic-component--hover';
const COMPONENT_ACTIVE = 'editor-dynamic-component--active';

const componentFactory: IDynamicComponentFactory = {
  getDynamicComponentRenderFactory: () => {
    return DynamicComponent;
  },
  getDynamicComponentCustomRenderFactory: () => {
    return DynamicComponentCustomRenderer;
  }
};

const PagePresentation: React.FC = observer(() => {

  const { event, dom, slot, store } = useContext(EditorContext);
  const presentationUtil = useMemo(() => new PagePresentationUtilContextProvider(), []);
  const presentationRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const subs = new SubSink();
    const presentation = presentationRef.current;

    // 组件UI特效开关,用于开启关闭组件激活和鼠标悬浮效果
    const componentUIEffectToggler = (() => {
      return {
        enable() {
          presentation.classList.remove(DISABLE_COMPONENT_UI_EFFECT);
        },
        disable() {
          // 隐藏组件激活边框
          presentation.classList.add(DISABLE_COMPONENT_UI_EFFECT);
        }
      };
    })();

    // 组件插槽特效控制器
    const componentSlotUIEffectHandler = (() => {
      let uniqueSlotMode: boolean;
      let uniqueSlotDoms: Array<HTMLElement>;
      const getComponentSlotDoms = (componentType: string): { matchedSlotDoms: Array<HTMLElement>, notMatchedSlotDoms: Array<HTMLElement> } => {
        const matchedSlotProperties = slot.getMatchedSlotProperties(componentType);
        const matchedSlotDoms = dom.getComponentMatchedSlotHost(matchedSlotProperties);
        const allSlotDoms = dom.getAllComponentSlotHosts();
        const notMatchedSlotDoms = _.difference(allSlotDoms, matchedSlotDoms);
        return { matchedSlotDoms, notMatchedSlotDoms };
      }

      return {
        enable(conf: IComponentConfiguration) {
          const { matchedSlotDoms, notMatchedSlotDoms } = getComponentSlotDoms(conf.type);

          notMatchedSlotDoms.forEach(el => {
            const sortableInstance: Sortable = el['sortableInstance'];
            sortableInstance.option('disabled', true);
          });

          if (!uniqueSlotMode) {
            matchedSlotDoms.forEach(el => {
              const sortableInstance: Sortable = el['sortableInstance'];
              sortableInstance.option('disabled', false);
              el.classList.add(COMPONENT_CONTAINER_DRAGGING);
            });
          } else {
            matchedSlotDoms.forEach(el => {
              const sortableInstance: Sortable = el['sortableInstance'];
              if (uniqueSlotDoms.some(ue => ue === el)) {
                sortableInstance.option('disabled', false);
                el.classList.add(COMPONENT_CONTAINER_DRAGGING);
              } else {
                sortableInstance.option('disabled', true);
              }
            });
          }
        },
        disable(conf: IComponentConfiguration) {
          const { matchedSlotDoms, notMatchedSlotDoms } = getComponentSlotDoms(conf.type);
          matchedSlotDoms.forEach(el => {
            el.classList.remove(COMPONENT_CONTAINER_DRAGGING);
          });
          notMatchedSlotDoms.forEach(el => {
            const sortableInstance: Sortable = el['sortableInstance'];
            sortableInstance.option('disabled', false);
          });
        },
        setUniqueSlot(slotDoms: Array<HTMLElement>) {
          uniqueSlotMode = true;
          uniqueSlotDoms = slotDoms;
        },
        cancelUniqueSlot() {
          uniqueSlotMode = false;
          uniqueSlotDoms = null;
        }
      };
    })();

    // 组件悬浮特效控制器
    const componentHoverUIEffectHandler = (() => {
      let lastHoveringComponentId: string;
      return {
        hover(componentId: string) {
          const lastDom = dom.getComponentHost(lastHoveringComponentId);
          if (lastDom) {
            lastDom.classList.remove(COMPONENT_HOVER);
          }
          const currentDom = dom.getComponentHost(componentId);
          if (currentDom) {
            currentDom.classList.add(COMPONENT_HOVER);
          }
          lastHoveringComponentId = componentId;
        }
      };
    })();

    const activeDetector = (() => {
      let lastActiveComponentId: string;
      const componentActiveListener = (e: MouseEvent) => {
        const elPath: Array<EventTarget> = e.composedPath();
        let presentationLocated = false;
        // 为了优化判断,先反向从windows>body>...方向,判断如果路径经过画布再执行接下来的判断
        for (let idx = elPath.length - 1; idx >= 0; idx--) {
          const el: HTMLDivElement = elPath[idx] as any;
          if (el === presentationRef.current) {
            presentationLocated = true;
            break;
          }
        }
        if (!presentationLocated) { return; }
        e.stopPropagation();
        let activeComponentId: string;
        for (let idx = 0; idx < elPath.length; idx++) {
          const el: HTMLDivElement = elPath[idx] as any;
          if (el && el.classList && el.classList.contains('editor-dynamic-component')) {
            activeComponentId = el.getAttribute('data-dynamic-component');
            break;
          }
        }

        if (activeComponentId && lastActiveComponentId !== activeComponentId) {
          e.stopPropagation();
          store.interactionStore.activeComponent(activeComponentId);
          event.emit(EventTopicEnum.componentActiving, activeComponentId);
          lastActiveComponentId = activeComponentId;
        }
      };

      return {
        observe() {
          document.body.addEventListener('click', componentActiveListener);
        },
        disconnect() {
          document.body.removeEventListener('click', componentActiveListener);
        }
      };
    })();

    const componentActiveUIEffectHandler = (() => {
      let lastActiveComponentId: string;
      let lastActiveComponentRootDom: HTMLElement;
      let lastActiveComponentHost: HTMLElement;
      return {
        activeComponent(id: string) {
          if (lastActiveComponentId === id) { return; }
          const componentHost = dom.getComponentHost(id);
          const componentRootDom = dom.getComponentRootDom(id);

          if (lastActiveComponentRootDom) {
            const evt = new CustomEvent('editor-event:cancel-active-component', { bubbles: true });
            lastActiveComponentRootDom.dispatchEvent(evt);
          }

          if (componentRootDom) {
            const evt = new CustomEvent('editor-event:active-component', { bubbles: true });
            componentRootDom.dispatchEvent(evt);
          }

          if (!componentHost) {
            console.error(`没有找到${id}组件host dom,请检查事件周期是否合理`);
            return;
          }

          componentHost.classList.add(COMPONENT_ACTIVE);
          if (lastActiveComponentHost) {
            lastActiveComponentHost.classList.remove(COMPONENT_ACTIVE);
          }

          lastActiveComponentId = id;
          lastActiveComponentRootDom = componentRootDom;
          lastActiveComponentHost = componentHost;
        }
      };
    })();

    const uniqueSlotUIEffectHandler = (() => {

      let uniqueTarget: EventTarget;
      const uniqueContainer = (e: CustomEvent) => {
        componentSlotUIEffectHandler.setUniqueSlot(e.detail.slots);
        uniqueTarget = e.target;
      };

      const cancelUniqueContainer = (e: CustomEvent) => {
        // 有些时候,关闭会有延时,例如A组件关闭唯一插槽后,B组件开启,那么如果因为延时,将会导致B组件开启唯一插槽失败
        if (uniqueTarget === e.target) {
          componentSlotUIEffectHandler.cancelUniqueSlot();
        }
      };

      return {
        observe() {
          presentationRef.current.addEventListener('editor-event:component-container-unique', uniqueContainer);
          presentationRef.current.addEventListener('editor-event:cancel-component-container-unique', cancelUniqueContainer);
        },
        disconnect() {
          presentationRef.current.removeEventListener('editor-event:component-container-unique', uniqueContainer);
          presentationRef.current.removeEventListener('editor-event:cancel-component-container-unique', cancelUniqueContainer);
        }
      };
    })();

    activeDetector.observe();
    uniqueSlotUIEffectHandler.observe();

    // 订阅组件拖拽事件,激活相应组件适配插槽
    subs.sink = event.message
      .pipe(filter(e => e.topic === EventTopicEnum.componentStartDragging || e.topic === EventTopicEnum.componentEndDragging))
      .pipe(filter(e => e.data))
      .subscribe(({ topic, data }) => {
        if (topic === EventTopicEnum.componentStartDragging) {
          // 关闭组件激活和悬浮特效
          componentUIEffectToggler.disable();
          // 高亮组件适配插槽
          componentSlotUIEffectHandler.enable(data);
        } else {
          componentUIEffectToggler.enable();
          componentSlotUIEffectHandler.disable(data);
        }
      });

    // 订阅组件hover事件,添加组件class特效
    subs.sink = event.message
      .pipe(filter(e => e.topic === EventTopicEnum.componentHovering))
      .pipe(map(evt => evt.data))
      .subscribe((componentId: string) => {
        componentHoverUIEffectHandler.hover(componentId);
      });

    subs.sink = event.message
      .pipe(filter(e => e.topic === EventTopicEnum.componentDomInit && e.data === store.interactionStore.pageComponentId))
      .pipe(first(), map(e => e.data))
      .subscribe(pageId => {
        event.emit(EventTopicEnum.componentActiving, pageId);
      });

    subs.sink = event.message
      .pipe(filter(e => e.topic === EventTopicEnum.componentActiving), map(e => e.data))
      .subscribe(id => {
        componentActiveUIEffectHandler.activeComponent(id);
      });

    return () => {
      activeDetector.disconnect();
      uniqueSlotUIEffectHandler.disconnect();
      subs.unsubscribe();
    };
  }, []);

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
});

PagePresentation.displayName = 'PagePresentation';

const RendererImplement: React.FC = observer(() => {
  const { store } = useContext(EditorContext);
  const schema = store.configurationStore.selectComponentConfigurationWithoutChildren(store.interactionStore.pageComponentId);

  return (
    <_Renderer schema={schema} />
  );
});

RendererImplement.displayName = 'RendererImplement';

export default PagePresentation;