import { ComponentDiscoveryContext, GenerateShortId, IComponentConfiguration } from '@tiangong/core';
import { observer } from 'mobx-react-lite';
import React, { memo, useContext, useEffect, useRef, useState, ComponentType, useMemo } from 'react';
import Sortable from 'sortablejs';
import { EditorContext, PagePresentationUtilContext } from '../../contexts';
import { EventTopicEnum } from '../../enums';
import * as _ from 'lodash';

const COMPONENT_ACTIVE_CLASSNAME = 'editor-dynamic-component--active';

export interface IDynamicComponentProps {
  configuration: IComponentConfiguration;
}

export const DynamicComponent: React.FC<IDynamicComponentProps> = memo(observer(props => {
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
        if (module) {
          Component.current = EditorUIEffectWrapper(ComponentRenderWrapper(module.default));
          setComponentLoaded(true);
        }
      })();
    }
  }, [conf.type]);

  return (
    <>
      {componentLoaded && <Component.current configuration={conf} />}
    </>
  );
}));

DynamicComponent.displayName = 'DynamicComponent';

export interface ICustomRenderDynamicComponentProps {
  configuration: IComponentConfiguration;
  children: React.ReactNode;
}

export const DynamicComponentCustomRenderer: React.FC<ICustomRenderDynamicComponentProps> = memo(observer(props => {

  const Wrapper: React.FC<ICustomRenderDynamicComponentProps> = useMemo(() => EditorUIEffectWrapper(ComponentRenderWrapper(ChildrenContentWrapper)), []);
  return (
    <Wrapper configuration={props.configuration} children={props.children} />
  );
}));

DynamicComponentCustomRenderer.displayName = 'DynamicComponentCustomRenderer';

const ChildrenContentWrapper: React.FC<ICustomRenderDynamicComponentProps> = memo(observer(props => {

  return (
    <>
      {props.children}
    </>
  );
}));

ChildrenContentWrapper.displayName = 'ChildrenContentWrapper';

const ComponentRenderWrapper = (Component: ComponentType<any>) => {

  const wrapper: React.FC<IDynamicComponentProps> = memo(observer(props => {
    let conf = { ...props.configuration };
    const componentId = conf.id;
    const { store, dom, event, slot } = useContext(EditorContext);
    const pagePresentationUtil = useContext(PagePresentationUtilContext);
    const slotProperties = slot.getSlotProperties(conf.type);
    if (slotProperties?.length) {
      slotProperties.forEach(property => {
        const slotComponentConfs = store.configurationStore.selectComponentFirstLayerChildren(componentId, property);
        if (slotComponentConfs?.length) {
          conf[property] = slotComponentConfs;
        }
      });
    }

    // TODO: 后面补充
    // const childrenIds = store.selectComponentChildrenIds(componentId);
    const childrenIds = [];
    const componentRef = useRef<HTMLElement>(null);
    const componentContainerRefs = useRef<HTMLElement[]>();

    // 注册动态组件root dom
    useEffect(() => {
      if (!componentId) { return; }
      componentRef.current = document.querySelector(`[data-dynamic-component="${componentId}"]`);
      if (!componentRef.current) {
        console.warn(`没有在组件类型为${props.configuration?.type}根节点下添加data-dynamic-component={componentId},所以该组件将不会响应设计器交互`);
        return;
      }
      componentRef.current.classList.add('editor-dynamic-component');
      dom.registryComponentDom(componentId, componentRef.current);
      return () => {
        dom.unRegistryComponentDom(componentId);
      };
    }, []);

    // 为组件的动态组件容器添加拖拽响应
    useEffect(() => {
      if (!componentRef.current) { return; }
      const containerSelector = `[data-dynamic-component-container][data-dynamic-container-owner="${componentId}"]`;
      componentContainerRefs.current = Array.from(componentRef.current.querySelectorAll(containerSelector));
      // 如果子节点没有发现,试试在父节点找,因为父节点可能本身也是容器
      let isContainer = componentContainerRefs.current.length > 0;
      if (!isContainer) {
        if (componentRef.current.getAttribute('data-dynamic-component-container')) {
          componentContainerRefs.current = [componentRef.current];
          isContainer = true;
        }
      }
      const sortableInstances: Sortable[] = [];
      const slotPropertyDoms: Array<HTMLElement> = [];
      if (isContainer) {
        componentContainerRefs.current.forEach(el => {
          const slotProperty: string = el.getAttribute('data-dynamic-component-container');
          const horizontal = el.getAttribute('data-dynamic-container-direction') === 'horizontal';
          dom.registryComponentSlotDom(conf.type, slotProperty, el);
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
            dragoverBubble: false,
            ghostClass: "editor-sortable-ghost",
            easing: "cubic-bezier(1, 0, 0, 1)",
            scroll: true,
            bubbleScroll: true,
            setData: (dataTransfer, dragEl: HTMLElement) => {
              const id = dragEl.getAttribute('data-dynamic-component');
              const conf = store.configurationStore.selectComponentConfigurationWithoutChildren(id);
              let componentTitle = store.configurationStore.selectComponentTitle(id)
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
              let conf: IComponentConfiguration = JSON.parse(confStr);
              if (conf.id) { return; }
              const getMatchedSlotProperties = slot.getMatchedSlotProperties(conf.type);
              const container2SlotProperty = dom.getSlotDomProperty(evt.to);
              if (!getMatchedSlotProperties.some(p => p === container2SlotProperty)) { return; }
              conf.id = GenerateShortId();
              conf = await slot.verifyAdding(conf.type, conf);
              // 新增的组件可能会有插槽组件数据,这里需要解析一下插槽配置
              const addComponent = (subConf: IComponentConfiguration, parentId: string, index: number, slotProperty: string) => {
                const slotProperties = slot.getSlotProperties(subConf.type);
                const pureConf: IComponentConfiguration = _.omit(subConf, slotProperties) as any;
                store.treeStore.addComponent(pureConf, parentId, index, slotProperty);
                for (let sp of slotProperties) {
                  const components: Array<IComponentConfiguration> = subConf[sp] || [];
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
              let conf: IComponentConfiguration = JSON.parse(confStr);
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
        });
      }
      return () => {
        sortableInstances.forEach(ins => ins.destroy());
        slotPropertyDoms.forEach(el => dom.unRegistryComponentSlotDom(el));
      };
    }, [childrenIds]);

    return (
      <Component configuration={conf} children={props['children']} />
    );
  }));

  return wrapper;
};

const EditorUIEffectWrapper = (Component: ComponentType<any>) => {

  const wrapper: React.FC<IDynamicComponentProps> = memo(observer(props => {

    const { store, dom, event } = useContext(EditorContext);
    const pagePresentationUtil = useContext(PagePresentationUtilContext);
    const [activeClassAdded, setActivedClassAdded] = useState(false);
    const componentId = props.configuration.id;
    const activeComponentId = store.interactionStore.activeComponentId;

    useEffect(() => {
      const nel = dom.getComponentDom(componentId);
      if (!nel) { return; }
      const componentActiveListener = (e: MouseEvent) => {
        e.stopPropagation();
        store.interactionStore.activeComponent(componentId);
        event.emit(EventTopicEnum.componentActiving, componentId);
      };

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

      nel.addEventListener('click', componentActiveListener);
      nel.addEventListener('mouseenter', componentMouseenterHandler);
      nel.addEventListener('mouseleave', componentMouseleaveHandler);

      return () => {
        nel.removeEventListener('click', componentActiveListener);
        nel.removeEventListener('mouseenter', componentMouseenterHandler);
        nel.removeEventListener('mouseleave', componentMouseleaveHandler);
      };
    }, []);

    useEffect(() => {
      const nel = dom.getComponentDom(componentId);
      if (!nel) { return; }
      if (componentId === activeComponentId) {
        if (!activeClassAdded) {
          nel.classList.add(COMPONENT_ACTIVE_CLASSNAME);
          setActivedClassAdded(true);
        }
      } else {
        if (activeClassAdded) {
          nel.classList.remove(COMPONENT_ACTIVE_CLASSNAME);
          setActivedClassAdded(false);
        }
      }
    }, [activeComponentId]);

    return (
      <Component configuration={props.configuration} children={props['children']} />
    );
  }));

  return wrapper;
};
