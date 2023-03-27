import { ComponentDiscoveryContext, GenerateComponentId, IComponentConfiguration, IComponentMetadata } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState, ComponentType, useMemo, memo } from 'react';
import Sortable from 'sortablejs';
import { EditorContext, PagePresentationUtilContext } from '../../contexts';
import { EventTopicEnum } from '../../enums';
import * as _ from 'lodash';
import { useComponentStyle } from '@lowcode-engine/renderer';
import classnames from 'classnames';

export interface IDynamicComponentProps {
  configuration: IComponentConfiguration;
}

export const DynamicComponent: React.FC<IDynamicComponentProps> = observer(props => {
  const conf = props.configuration;
  const compDiscovery = useContext(ComponentDiscoveryContext);
  const [componentLoaded, setComponentLoaded] = useState(false);
  const Component = useRef<any>(null);

  useEffect(() => {
    if (conf.type && !componentLoaded) {
      (async () => {
        let module: { default: any } = await compDiscovery.loadComponentDesignTimeModule(props.configuration.type, 'pc');
        if (!module) {
          module = await compDiscovery.loadComponentRunTimeModule(props.configuration.type, 'pc');
        }
        if (module && module.default) {
          Component.current = EditorUIEffectWrapper(ComponentRenderWrapper(module.default));
          setComponentLoaded(true);
        }

        // let metadataModule: { default: IComponentMetadata } = await compDiscovery.loadComponentMetadataModule(props.configuration.type);
        // if (metadataModule && metadataModule.default) {
        //   console.log(`metadata:`, metadataModule.default);

        // }
      })();
    }

    return () => {

    };
  }, [conf.type]);

  return (
    <>
      {componentLoaded && <Component.current configuration={conf} />}
    </>
  );
});

DynamicComponent.displayName = 'DynamicComponent';

export interface ICustomRenderDynamicComponentProps {
  configuration: IComponentConfiguration;
  children: React.ReactNode;
}

export const DynamicComponentCustomRenderer: React.FC<ICustomRenderDynamicComponentProps> = observer(props => {

  const Wrapper: React.FC<ICustomRenderDynamicComponentProps> = useMemo(() => EditorUIEffectWrapper(ComponentRenderWrapper(ChildrenContentWrapper)), []);
  return (
    <Wrapper configuration={props.configuration} children={props.children} />
  );
});

DynamicComponentCustomRenderer.displayName = 'DynamicComponentCustomRenderer';

const ChildrenContentWrapper: React.FC<ICustomRenderDynamicComponentProps> = observer(props => {

  return (
    <>
      {props.children}
    </>
  );
});

ChildrenContentWrapper.displayName = 'ChildrenContentWrapper';

const ComponentRenderWrapper = (Component: ComponentType<any>) => {

  const wrapper: React.FC<IDynamicComponentProps> = observer(props => {
    const conf = { ...props.configuration };
    const componentId = conf.id;
    const { store, slot } = useContext(EditorContext);
    const slotProperties = slot.getSlotProperties(conf.type);
    // 补充子组件配置
    if (slotProperties?.length) {
      slotProperties.forEach(property => {
        const slotComponentConfs = store.configurationStore.selectComponentFirstLayerChildren(componentId, property);
        if (slotComponentConfs?.length) {
          if (slot.checkSlotSingleton(conf.type, property)) {
            conf[property] = slotComponentConfs[0];
          } else {
            conf[property] = slotComponentConfs;
          }
        }
      });
    }

    return (
      <Component configuration={conf} children={props['children']} />
    );
  });

  return wrapper;
};

const EditorUIEffectWrapper = (Component: ComponentType<any>) => {

  const wrapper: React.FC<IDynamicComponentProps> = memo(props => {

    const { store, dom, event, slot, configurationAddingHandler } = useContext(EditorContext);
    const pagePresentationUtil = useContext(PagePresentationUtilContext);
    const conf = props.configuration;
    const style = useComponentStyle(props.configuration);
    const componentHostRef = useRef<HTMLDivElement>(null);
    const componentRootRef = useRef<HTMLElement>(null);
    const toolbarIntersectingFlagRef = useRef<HTMLDivElement>(null);
    const componentContainerRefs = useRef<HTMLElement[]>();
    const componentId = conf.id;

    useEffect(() => {
      const componentHost = componentHostRef.current;
      if (componentHost.children.length) {
        componentRootRef.current = componentHost.children[componentHost.children.length - 1] as any;
        dom.registryComponentRoot(componentId, componentRootRef.current);
      }
      const hoverDetector = (() => {
        const componentMouseenterHandler = (e: MouseEvent) => {
          e.stopPropagation();
          pagePresentationUtil.componentHover(componentId);
          event.emit(EventTopicEnum.componentHovering, pagePresentationUtil.hoveredComponentId);
        };

        const componentMouseleaveHandler = (e: MouseEvent) => {
          e.stopPropagation();
          pagePresentationUtil.componentUnHover();
          event.emit(EventTopicEnum.componentHovering, pagePresentationUtil.hoveredComponentId);
        };

        return {
          observe() {
            componentHost.addEventListener('mouseenter', componentMouseenterHandler);
            componentHost.addEventListener('mouseleave', componentMouseleaveHandler);
          },
          disconnect() {
            componentHost.removeEventListener('mouseenter', componentMouseenterHandler);
            componentHost.removeEventListener('mouseleave', componentMouseleaveHandler);
          }
        };
      })();

      hoverDetector.observe();

      // 监听组件工具栏指示标记显隐性
      const intersectingDetector = (() => {
        const intersectingObs = new IntersectionObserver(entries => {
          event.emit(EventTopicEnum.toolbarIntersectingChange, { componentId, intersecting: entries[0].isIntersecting === true });
        }, {});

        return {
          observe() {
            intersectingObs.observe(toolbarIntersectingFlagRef.current);
          },
          disconnect() {
            intersectingObs.disconnect();
          }
        };
      })();

      intersectingDetector.observe();

      dom.registryComponentHost(componentId, componentHostRef.current);
      return () => {
        intersectingDetector.disconnect();
        hoverDetector.disconnect();
        dom.unregisterComponentHost(componentId);
        dom.unregisterComponentRoot(componentId);
      };
    }, []);

    // 为组件的动态组件容器添加拖拽响应
    useEffect(() => {
      const componentHost = componentHostRef.current;
      const containerSelector = `[data-dynamic-component-container][data-dynamic-container-owner="${componentId}"]`;
      componentContainerRefs.current = Array.from(componentHost.querySelectorAll(containerSelector));
      // 如果子节点没有发现,试试在父节点找,因为父节点可能本身也是容器
      let isContainer = componentContainerRefs.current.length > 0;
      if (!isContainer) {
        if (componentHost.getAttribute('data-dynamic-component-container')) {
          componentContainerRefs.current = [componentHostRef.current];
          isContainer = true;
        }
      }
      const sortableInstances: Sortable[] = [];
      const slotPropertyDoms: Array<HTMLElement> = [];

      if (isContainer) {
        // 添加拖拽支持以及滚动监听
        componentContainerRefs.current.forEach(el => {
          // 拖拽支持
          const slotProperty: string = el.getAttribute('data-dynamic-component-container');
          const horizontal = el.getAttribute('data-dynamic-container-direction') === 'horizontal';
          dom.registryComponentSlotHost(conf.type, slotProperty, el);
          slotPropertyDoms.push(el);
          el.classList.add('editor-dynamic-component-container');
          if (horizontal) {
            el.classList.add('editor-dynamic-component-container--horizontal');
          }
          // 在onStart的时候无法通过dataTransfer获取当前操作的配置信息,所有暂时先用这个方法
          let currentConf: IComponentConfiguration | null;
          // 为可视化拖拽设置专有背景色
          const instance = Sortable.create(el, {
            group: {
              name: 'dynamic-component',
            },
            // dragoverBubble: false,
            // direction: horizontal ? 'horizontal' : 'vertical',
            // dropBubble: false,
            // dragoverBubble: false,
            ghostClass: "editor-sortable-ghost",
            easing: "cubic-bezier(1, 0, 0, 1)",
            scroll: true,
            bubbleScroll: false,
            animation: 150,
            // emptyInsertThreshold: 5,
            // fallbackOnBody: true,
            swapThreshold: 0.65,
            setData: (dataTransfer, dragEl: HTMLElement) => {
              const id = dragEl.getAttribute('data-dynamic-component');
              const conf = store.configurationStore.selectComponentConfigurationWithoutChildren(id);
              const componentTitle = store.configurationStore.selectComponentTitle(id)
              pagePresentationUtil.dragPreviewNode.innerHTML = componentTitle;
              pagePresentationUtil.dragPreviewNode.classList.remove('hidden');
              dataTransfer.setDragImage(pagePresentationUtil.dragPreviewNode, 0, 0);
              if (conf) {
                dataTransfer.setData('Text', JSON.stringify(conf));
              }
              currentConf = _.cloneDeep(conf);
            },
            onAdd: async (evt: Sortable.SortableEvent) => {
              const dragEvt: DragEvent = (evt as any).originalEvent;
              const containerSlotProperty: string = evt.to.getAttribute('data-dynamic-component-container');
              const confStr = dragEvt.dataTransfer.getData('Text');
              if (!confStr) { return; }
              const conf: IComponentConfiguration = JSON.parse(confStr);
              if (conf.id) { return; }
              const matchedSlotProperties = slot.getMatchedSlotProperties(conf.type);
              const container2SlotProperty = dom.getSlotDomProperty(evt.to);
              if (!matchedSlotProperties.some(p => p === container2SlotProperty)) { return; }
              conf.id = GenerateComponentId(conf.type);
              // 新增的组件可能会有插槽组件数据,这里需要解析一下插槽配置
              const addComponent = async (subConf: IComponentConfiguration, parentId: string, index: number, slotProperty: string) => {
                const slotProperties = slot.getSlotProperties(subConf.type);
                const parentConf = store.configurationStore.selectComponentConfigurationWithoutChildren(parentId);
                subConf = await configurationAddingHandler.handle(subConf, parentConf, slotProperty);
                const pureConf: IComponentConfiguration = _.omit(subConf, slotProperties) as any;
                store.addComponent(pureConf, parentId, index, slotProperty);
                for (const sp of slotProperties) {
                  const singleton = slot.checkSlotSingleton(subConf.type, sp);
                  let components: Array<IComponentConfiguration> = [];
                  if (subConf[sp]) {
                    if (singleton) {
                      components.push(subConf[sp]);
                    } else {
                      components = subConf[sp];
                    }
                  }
                  if (!components.length) { continue; }
                  components.forEach((sc, idx) => {
                    addComponent(sc, subConf.id, idx, sp);
                  });
                }
              };
              addComponent(conf, componentId, evt.newIndex, containerSlotProperty);
            },
            onStart: (evt: Sortable.SortableEvent) => {
              event.emit(EventTopicEnum.componentStartDragging, currentConf);
              const itemEl = evt.item;
              itemEl.classList.add('dragging');
            },
            onEnd: (evt: Sortable.SortableEvent) => {
              event.emit(EventTopicEnum.componentEndDragging, { ...currentConf });
              currentConf = null;
              const itemEl = evt.item;
              const parentId = evt.to.getAttribute('data-dynamic-container-owner');
              if (!parentId) { return; }
              const containerDom: HTMLElement = evt.to as any;
              const slotProperty: string = containerDom.getAttribute('data-dynamic-component-container');
              const dragEvt: DragEvent = (evt as any).originalEvent;
              const confStr = dragEvt.dataTransfer.getData('Text');
              if (!confStr) { return; }
              const conf: IComponentConfiguration = JSON.parse(confStr);
              if (!conf.id) { return; }
              const getMatchedSlotProperties = slot.getMatchedSlotProperties(conf.type);
              const container2SlotProperty = dom.getSlotDomProperty(evt.to);
              const cancelRemove = () => {
                itemEl.parentElement.removeChild(itemEl);
                evt.from.appendChild(itemEl);
              };

              if (!getMatchedSlotProperties.some(p => p === container2SlotProperty)) {
                cancelRemove();
                return;
              }
              if (evt.from !== evt.to) {
                cancelRemove();
                itemEl.style.display = 'none';
              }
              store.treeStore.moveComponent(conf.id, parentId, evt.newIndex, slotProperty);
            }
          });

          el['sortableInstance'] = instance;
          sortableInstances.push(instance);

          const scrollDetector = (() => {
            let lastScrollAt = Date.now();
            let scrollTimeout = null;

            const scrollDetecting = () => {

              if (Date.now() - lastScrollAt > 100) {
                event.emit(EventTopicEnum.componentContainerScrollStart);
              }

              lastScrollAt = Date.now()

              if (scrollTimeout) {
                clearTimeout(scrollTimeout);
              }

              scrollTimeout = setTimeout(function () {
                if (Date.now() - lastScrollAt > 99) {
                  event.emit(EventTopicEnum.componentContainerScrollEnd);
                }
              }, 100);
            }

            return {
              observe() {
                el.addEventListener('scroll', scrollDetecting);
              },
              disconnect() {
                el.removeEventListener('scroll', scrollDetecting);
              }
            };
          })();

          // 滚动监听
          scrollDetector.observe();
        });
      }
      return () => {
        sortableInstances.forEach(ins => ins.destroy());
        slotPropertyDoms.forEach(el => dom.unregisterComponentSlotHost(el));
      };
    }, []);

    return (
      <div className={classnames(
        'dynamic-component',
        'editor-dynamic-component',
      )}
        data-dynamic-component={componentId}
        data-dynamic-component-type={conf.type}
        style={style}
        ref={componentHostRef}
      >
        <div className='toolbar-intersecting-flag' ref={toolbarIntersectingFlagRef}></div>
        <div className='dragdrop-placeholder-flag'></div>
        <div className='presentation-flag presentation-flag__activated-state'></div>
        <div className='presentation-flag presentation-flag__hovering-state'></div>
        {/* 别在把其他辅助节点加在Component后面,因为设计器会根据最后一个节点获取动态组件根节点dom */}
        <Component configuration={props.configuration} children={props['children']} />
      </div>
    );
  });

  return wrapper;
};
