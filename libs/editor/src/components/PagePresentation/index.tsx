import React, { useContext, useLayoutEffect, useMemo, useRef } from 'react';
import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { _Renderer as Renderer } from '@lowcode-engine/renderer';
import { EditorContext, PagePresentationUtilContext, PagePresentationUtilContextProvider } from '../../contexts';
import { DynamicComponentFactoryContext, IDynamicComponentFactory } from '@lowcode-engine/core';
import { DynamicComponent, DynamicComponentContainer } from '../DynamicComponent';
import { filter } from 'rxjs/operators';
import { EventTopicEnum } from '../../enums';
import { SubSink } from 'subsink';
import Sortable from 'sortablejs';
import * as _ from 'lodash';
import { ComponentToolBarWrapper } from '../ComponentToolBar';
import { IDynamicContainerDragDropEventData } from '../../models';

const DISABLE_COMPONENT_UI_EFFECT = 'disable-component-ui-effect';
const COMPONENT_CONTAINER_DRAGGING = 'editor-dynamic-component-container--dragging';
const COMPONENT_HOVER = 'editor-dynamic-component--hover';

const PagePresentation: React.FC = observer(() => {

  const { event, dom, slot, store, configuration } = useContext(EditorContext);
  const presentationUtil = useMemo(() => new PagePresentationUtilContextProvider(), []);
  const presentationRef = useRef<HTMLDivElement>();

  const componentFactory = useMemo<IDynamicComponentFactory>(() => {
    return {
      hierarchyManager: {
        getParent(id) {
          return configuration.getParentComponent(id);
        },
        getComponentPath(id) {
          const confs = configuration.getComponentPath(id);
          return confs.splice(0, confs.length - 1);
        },
        getTreeInfo(id) {
          return null;
        },
      },
      getDynamicComponentFactory: () => {
        return DynamicComponent;
      },
      getDynamicComponentContainerFactory: () => {
        return DynamicComponentContainer;
      },
    };
  }, []);

  useLayoutEffect(() => {
    const subs = new SubSink();
    const presentation = presentationRef.current;
    let dragging = false;

    // 组件UI特效开关,用于开启关闭组件激活和鼠标悬浮效果
    const componentUIEffectToggler = (() => {
      return {
        enable() {
          presentation.classList.remove(DISABLE_COMPONENT_UI_EFFECT);
        },
        disable() {
          // 隐藏组件激活边框
          presentation.classList.add(DISABLE_COMPONENT_UI_EFFECT);
        },
      };
    })();

    // 组件插槽特效控制器
    const componentSlotUIEffectHandler = (() => {
      let uniqueSlotMode: boolean;
      let uniqueSlotDoms: Array<HTMLElement>;

      let matchedSlotDoms: Array<HTMLElement>;
      let notMatchedSlotDoms: Array<HTMLElement>;

      const getComponentSlotDoms = (componentType: string) => {
        const matchedSlotProperties = slot.getMatchedSlotProperties(componentType);
        const matchedSD = dom.getComponentMatchedSlotHost(matchedSlotProperties);
        const allSlotDoms = dom.getAllComponentSlotHosts();
        const notMatchedSD = _.difference(allSlotDoms, matchedSD);
        return { matchedSlotDoms: matchedSD, notMatchedSlotDoms: notMatchedSD };
      };

      return {
        startDraging(data: IDynamicContainerDragDropEventData) {
          const { matchedSlotDoms: matchedSD, notMatchedSlotDoms: notMatchSD } = getComponentSlotDoms(data.conf.type);
          matchedSlotDoms = [];
          notMatchedSlotDoms = notMatchSD;

          // 适配插槽会有几个判断
          // 第一是是否处于唯一拖拽插槽模式
          // 第二是组件是否是仅仅能拖入,不能拖出模式

          // 第一种模式
          if (uniqueSlotMode) {
            matchedSD.forEach(el => {
              if (uniqueSlotDoms.some(ue => ue === el)) {
                matchedSlotDoms.push(el);
              } else {
                notMatchedSlotDoms.push(el);
              }
            });
          } else {
            matchedSD.forEach(el => {
              matchedSlotDoms.push(el);
            });
          }

          // 第二种模式
          const containerDropOnly = data.ownContainer.getAttribute('data-dynamic-container-drop-only') === 'true';
          if (containerDropOnly) {
            _.remove(matchedSlotDoms, it => {
              const isContainer = it === data.ownContainer;
              if (!isContainer) {
                notMatchedSlotDoms.push(it);
              }
              return !isContainer;
            });
          }

          matchedSlotDoms.forEach(el => {
            el.classList.add(COMPONENT_CONTAINER_DRAGGING);
          });

          notMatchedSlotDoms.forEach(el => {
            // eslint-disable-next-line prefer-destructuring
            const sortableInstance: Sortable = el['sortableInstance'];
            sortableInstance.option('disabled', true);
          });
        },
        endDraging() {
          matchedSlotDoms.forEach(el => {
            el.classList.remove(COMPONENT_CONTAINER_DRAGGING);
          });
          notMatchedSlotDoms.forEach(el => {
            // eslint-disable-next-line prefer-destructuring
            const sortableInstance: Sortable = el['sortableInstance'];
            sortableInstance.option('disabled', false);
          });
          matchedSlotDoms = undefined;
          notMatchedSlotDoms = undefined;
        },
        setUniqueDragingSlot(slotDoms: Array<HTMLElement>) {
          uniqueSlotMode = true;
          uniqueSlotDoms = slotDoms;
        },
        cancelUniqueDragingSlot() {
          uniqueSlotMode = false;
          uniqueSlotDoms = null;
        },
      };
    })();

    // 组件悬浮特效控制器
    const componentHoverUIEffectHandler = (() => {
      let lastHoveringComponentId: string;
      const componentHoverPath: Array<string> = [];

      const hoverEffect = () => {
        const hoverId = componentHoverPath[componentHoverPath.length - 1];
        const lastDom = dom.getComponentHost(lastHoveringComponentId);
        if (lastDom) {
          lastDom.classList.remove(COMPONENT_HOVER);
        }
        const currentDom = dom.getComponentHost(hoverId);
        if (currentDom) {
          currentDom.classList.add(COMPONENT_HOVER);
        }
        lastHoveringComponentId = hoverId;
      };

      return {
        hover(componentId: string) {
          if (!componentHoverPath.some(pid => pid === componentId)) {
            componentHoverPath.push(componentId);
          }
          hoverEffect();
        },
        unHover() {
          componentHoverPath.pop();
          hoverEffect();
        },
      };
    })();

    const activeDetector = (() => {
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

        if (activeComponentId) {
          e.stopPropagation();
          const lastActiveComponentId = store.interactionStore.activeComponentId;
          if (activeComponentId === lastActiveComponentId) { return; }

          store.interactionStore.activeComponent(activeComponentId);
        }
      };

      return {
        observe() {
          document.body.addEventListener('click', componentActiveListener);
        },
        disconnect() {
          document.body.removeEventListener('click', componentActiveListener);
        },
      };
    })();

    const uniqueSlotUIEffectHandler = (() => {

      let uniqueTarget: EventTarget;
      const uniqueContainer = (e: CustomEvent) => {
        componentSlotUIEffectHandler.setUniqueDragingSlot(e.detail.slots);
        uniqueTarget = e.target;
      };

      const cancelUniqueContainer = (e: CustomEvent) => {
        // 有些时候,关闭会有延时,例如A组件关闭唯一插槽后,B组件开启,那么如果因为延时,将会导致B组件开启唯一插槽失败
        if (uniqueTarget === e.target) {
          componentSlotUIEffectHandler.cancelUniqueDragingSlot();
        }
      };

      return {
        observe() {
          presentationRef.current.addEventListener('editor-event:component-container-unique', uniqueContainer as any);
          presentationRef.current.addEventListener('editor-event:cancel-component-container-unique', cancelUniqueContainer as any);
        },
        disconnect() {
          presentationRef.current.removeEventListener('editor-event:component-container-unique', uniqueContainer as any);
          presentationRef.current.removeEventListener('editor-event:cancel-component-container-unique', cancelUniqueContainer as any);
        },
      };
    })();

    activeDetector.observe();
    uniqueSlotUIEffectHandler.observe();

    // 订阅组件拖拽事件,激活相应组件适配插槽
    subs.sink = event.message
      .pipe(filter(e => e.topic === EventTopicEnum.componentStartDragging || e.topic === EventTopicEnum.componentEndDragging))
      .pipe(filter(e => e.data))
      .subscribe(({ topic, data }: { topic: EventTopicEnum | string, data?: IDynamicContainerDragDropEventData }) => {
        if (topic === EventTopicEnum.componentStartDragging) {
          dragging = true;
          // 关闭组件激活和悬浮特效
          componentUIEffectToggler.disable();
          // 高亮组件适配插槽
          componentSlotUIEffectHandler.startDraging(data);
        } else {
          dragging = false;
          componentUIEffectToggler.enable();
          componentSlotUIEffectHandler.endDraging();
        }
      });

    // 订阅组件hover事件,添加组件class特效
    subs.sink = event.message
      .pipe(filter(e => e.topic === EventTopicEnum.componentHovering || e.topic === EventTopicEnum.componentUnHovering), filter(() => !dragging))
      .subscribe(({ topic, data }) => {
        if (topic === EventTopicEnum.componentHovering) {
          componentHoverUIEffectHandler.hover(data);
        } else {
          componentHoverUIEffectHandler.unHover();
        }
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
  const schema = store.configurationStore.selectComponentConfigurationWithoutChildren(store.interactionStore.rootId);

  return (
    <Renderer schema={schema} />
  );
});

RendererImplement.displayName = 'RendererImplement';

export default PagePresentation;