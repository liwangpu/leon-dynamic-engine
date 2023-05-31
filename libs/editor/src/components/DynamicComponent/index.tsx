import { ComponentDiscoveryContext, GenerateComponentId, IComponentConfiguration, IDynamicComponentContainerRendererRef, IDynamicComponentContainerProps, IDynamicComponentProps } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState, ComponentType, useMemo, useLayoutEffect, useImperativeHandle, forwardRef, memo } from 'react';
import Sortable from 'sortablejs';
import { EditorContext, PagePresentationUtilContext } from '../../contexts';
import { EventTopicEnum } from '../../enums';
import * as _ from 'lodash';
import classnames from 'classnames';
import { IDynamicContainerDragDropEventData } from '../../models';
import { ComponentAttributeWrapper, DataCenterDetectorWrapper } from '@lowcode-engine/renderer';

const loadRemoteModule = async (loader: () => Promise<any>) => {
  try {
    return await loader();
  } catch (err) {
    //
  }
};

const componentEditorWrapper = (Component: ComponentType<IDynamicComponentProps>) => {
  return DynamicComponentValidate(DataCenterDetectorWrapper(ComponentAttributeWrapper(EditorUIEffectWrapper(ChildSlotProperyPatchWrapper(Component)))));
};

export const DynamicComponent: React.FC<IDynamicComponentProps> = observer(props => {
  const conf = props.configuration;
  const componentType = conf?.type;
  const CustomRender = props.children;
  const compDiscovery = useContext(ComponentDiscoveryContext);
  const [componentLoaded, setComponentLoaded] = useState(false);
  const [Component, setComponent] = useState<ComponentType<IDynamicComponentProps>>();
  useEffect(() => {
    if (!componentType) {
      setComponentLoaded(true);
      return;
    }
    if (CustomRender) {
      setComponent(componentEditorWrapper(ChildrenContentWrapper));
      setComponentLoaded(true);
    } else if (conf.type) {
      (async () => {
        let module: { default: any };
        module = await loadRemoteModule(() => compDiscovery.loadComponentDesignTimeModule(componentType, 'pc'));
        if (!module) {
          module = await loadRemoteModule(() => compDiscovery.loadComponentRunTimeModule(componentType, 'pc'));
        }
        if (module && module.default) {
          setComponent(componentEditorWrapper(module.default));
        }
        setComponentLoaded(true);
      })();
    }
  }, [componentType]);

  return (
    <>
      {componentLoaded && (
        Component ? (
          <Component {...props} />
        ) : (
          <div className='component-not-defined'>组件未定义</div>
        )
      )}
    </>
  );
});

DynamicComponent.displayName = 'DynamicComponent';

export const DynamicComponentContainer = observer(forwardRef<IDynamicComponentContainerRendererRef, IDynamicComponentContainerProps>((props, ref) => {
  const { children: CustomSlotRenderer, direction = 'vertical', className, dropOnly, slot: slotProperty, style } = props;
  const componentId = props.configuration.id;
  const horizontal = direction === 'horizontal';
  const { store, slot, dom, event, configuration } = useContext(EditorContext);
  const pagePresentationUtil = useContext(PagePresentationUtilContext);
  const slotRendererRef = useRef<HTMLDivElement>();
  const conf = store.structure.selectComponentConfigurationWithoutChildren(componentId, true);
  const slotComponentConfs = store.structure.selectComponentFirstLayerChildren(componentId, slotProperty);
  const containerClassName = useMemo(() => {
    const arr: Array<any> = [
      'editor-dynamic-component-container',
      {
        'editor-dynamic-component-container--horizontal': horizontal,
        'editor-dynamic-component-container--vertical': !horizontal,
      },
    ];

    if (className) {
      if (_.isArray(className)) {
        className.forEach(c => arr.push(c));
      } else {
        arr.push(className);
      }
    }

    return arr;
  }, [className, horizontal]);

  if (slotComponentConfs?.length) {
    if (slot.checkSlotSingleton(conf.type, slotProperty)) {
      conf[slotProperty] = slotComponentConfs[0];
    } else {
      conf[slotProperty] = slotComponentConfs;
    }
  }

  const childrenConfs: Array<IComponentConfiguration> = conf && conf[slotProperty] || [];

  useImperativeHandle(ref, () => ({
    scrollToEnd() {
      const container = slotRendererRef.current;
      if (horizontal) {
        if (container.scrollWidth > container.clientWidth) {
          container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
        }
      } else {
        if (container.scrollHeight > container.clientHeight) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
      }
    },
    getContainerRef() {
      return slotRendererRef.current;
    },
  }));

  useLayoutEffect(() => {
    const slotHost = slotRendererRef.current;
    const scrollDetector = (() => {
      let lastScrollAt = Date.now();
      let scrollTimeout = null;
      const debounceTime = 150;
      const scrollDetecting = () => {

        if (Date.now() - lastScrollAt > debounceTime) {
          event.emit(EventTopicEnum.componentContainerScrollStart);
        }

        lastScrollAt = Date.now();

        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        scrollTimeout = setTimeout(function () {
          if (Date.now() - lastScrollAt > (debounceTime - 1)) {
            event.emit(EventTopicEnum.componentContainerScrollEnd);
          }
        }, debounceTime);
      };

      return {
        observe() {
          slotHost.addEventListener('scroll', scrollDetecting);
        },
        disconnect() {
          slotHost.removeEventListener('scroll', scrollDetecting);
        },
      };
    })();

    // 滚动监听
    scrollDetector.observe();
    return () => {
      scrollDetector.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    if (!conf || !conf.id || !conf.type) {
      console.warn(`DynamicComponentContainer接收到实施参数不完整,拖拽将不会实施`,);
      return;
    }
    const slotHost = slotRendererRef.current;
    // 添加拖拽支持以及滚动监听
    // 拖拽支持
    dom.registryComponentSlotHost(conf.type, slotProperty, slotHost);
    // 在onStart的时候无法通过dataTransfer获取当前操作的配置信息,所有暂时先用这个方法
    let currentConf: IComponentConfiguration | null;
    // 为可视化拖拽设置专有背景色
    const instance = Sortable.create(slotHost, {
      group: {
        name: 'dynamic-component',
        pull: !dropOnly,
      },
      ghostClass: "editor-sortable-ghost",
      easing: "cubic-bezier(1, 0, 0, 1)",
      scroll: true,
      bubbleScroll: false,
      animation: 100,
      swapThreshold: 0.65,
      setData: (dataTransfer, dragEl: HTMLElement) => {
        const id = dragEl.getAttribute('data-dynamic-component');
        const conf = store.structure.selectComponentConfigurationWithoutChildren(id);
        const componentTitle = store.structure.selectComponentTitle(id);
        if (pagePresentationUtil.dragPreviewNode) {
          pagePresentationUtil.dragPreviewNode.innerHTML = componentTitle;
          pagePresentationUtil.dragPreviewNode.classList.remove('hidden');
          dataTransfer.setDragImage(pagePresentationUtil.dragPreviewNode, 0, 0);
        }
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
          const pureConf: IComponentConfiguration = _.omit(subConf, slotProperties) as any;
          const canAdd = await configuration.addComponent(pureConf, parentId, index, slotProperty);
          if (!canAdd) { return; }
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
        const eventData: IDynamicContainerDragDropEventData = {
          conf: currentConf,
          dragItem: evt.item,
          ownContainer: evt.item.parentNode as any,
        };
        event.emit(EventTopicEnum.componentStartDragging, eventData);
        const itemEl = evt.item;
        itemEl.classList.add('dragging');
      },
      onEnd: async (evt: Sortable.SortableEvent) => {
        const eventData: IDynamicContainerDragDropEventData = {
          conf: currentConf,
          dragItem: evt.item,
          ownContainer: evt.item.parentNode as any,
        };

        event.emit(EventTopicEnum.componentEndDragging, eventData);
        currentConf = null;
        const itemEl = evt.item;
        itemEl.classList.remove('dragging');
        const from = evt.oldIndex;
        const to = evt.newIndex;
        const parentId = evt.to.getAttribute('data-dynamic-container-owner');
        if (!parentId) { return; }
        const containerDom: HTMLElement = evt.to as any;
        const slotProperty: string = containerDom.getAttribute('data-dynamic-component-container');
        const dragEvt: DragEvent = (evt as any).originalEvent;
        const confStr = dragEvt.dataTransfer.getData('Text');
        if (!confStr) { return; }
        const conf: IComponentConfiguration = JSON.parse(confStr);
        if (!conf.id) { return; }

        const cancelRemove = () => {
          // 注意,取消跨容器拖动和同容器拖动是不一样的

          if (evt.from !== evt.to) {
            // 取消跨容器拖动
            itemEl.parentElement.removeChild(itemEl);
            evt.from.appendChild(itemEl);
          } else {
            // 取消同容器拖动

            // 注意,这里的children是拖动后的元素顺序了
            const children = (evt.from as HTMLDivElement).children;
            const originItemEl = children[to];
            // 小序号往大序号拖动,取拖动前下一个元素,before把元素还原回原来位置
            if (from < to) {
              const nextDom = children[from];
              nextDom.before(originItemEl);
            } else {
              // 大序号往小序号拖动,取拖动前的上一个元素,after把元素还原回原来位置
              const previousDom = children[from];
              previousDom.after(originItemEl);
            }
          }
        };

        cancelRemove();
        await configuration.moveComponent(conf.id, parentId, slotProperty, evt.newIndex);
      },
    });
    slotHost['sortableInstance'] = instance;
    return () => {
      instance.destroy();
      dom.unregisterComponentSlotHost(slotHost);
    };
  }, [componentId, direction, slotProperty]);

  return (
    <div
      className={classnames(containerClassName)}
      ref={slotRendererRef}
      style={style}
      data-dynamic-component-container={slotProperty}
      data-dynamic-container-direction={direction || 'vertical'}
      data-dynamic-container-owner={componentId}
      data-dynamic-container-drop-only={_.isNil(dropOnly) ? 'false' : `${dropOnly}`}
    >
      {_.isFunction(CustomSlotRenderer) ?
        CustomSlotRenderer(childrenConfs) : (
          <>
            {childrenConfs && childrenConfs.map(c => (<DynamicComponent key={c.id} configuration={c} />))}
          </>
        )
      }
    </div>
  );
}));

DynamicComponentContainer.displayName = 'DynamicComponentContainer';

const ChildrenContentWrapper: React.FC<IDynamicComponentProps> = memo(props => {

  return (
    <>
      {_.isFunction(props.children) ? props.children(props.configuration) : props.children}
    </>
  );
});

ChildrenContentWrapper.displayName = 'ChildrenContentWrapper';

const ChildSlotProperyPatchWrapper = (Component: ComponentType<IDynamicComponentProps>) => {

  const wrapper: React.FC<IDynamicComponentProps> = observer(props => {
    const conf = { ...props.configuration };
    const componentId = conf.id;
    const { store, slot } = useContext(EditorContext);
    const slotProperties = slot.getSlotProperties(conf.type);
    // 补充子组件配置
    if (slotProperties?.length) {
      slotProperties.forEach(property => {
        const slotComponentConfs = store.structure.selectComponentFirstLayerChildren(componentId, property);
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
      <Component {...props} configuration={conf} />
    );
  });

  wrapper.displayName = 'ChildSlotProperyPatchWrapper';

  return wrapper;
};

const EditorUIEffectWrapper = (Component: ComponentType<IDynamicComponentProps>) => {
  const wrapper: React.FC<IDynamicComponentProps> = observer(props => {
    const { store, dom, event } = useContext(EditorContext);
    const conf = props.configuration;
    const { activeComponentId } = store.interaction;
    const activeEventFlag = useRef<boolean>();
    const componentHostRef = useRef<HTMLDivElement>(null);
    const componentRootRef = useRef<HTMLElement>(null);
    const toolbarIntersectingFlagRef = useRef<HTMLDivElement>(null);
    const componentId = conf.id;
    useLayoutEffect(() => {
      const componentHost = componentHostRef.current;
      if (componentHost.children.length) {
        componentRootRef.current = componentHost.children[componentHost.children.length - 1] as any;
        dom.registryComponentRoot(componentId, componentRootRef.current);
      }

      const hoverDetector = (() => {
        const componentMouseenterHandler = (e: MouseEvent) => {
          e.stopPropagation();
          event.emit(EventTopicEnum.componentHovering, componentId);
        };

        const componentMouseleaveHandler = (e: MouseEvent) => {
          e.stopPropagation();
          event.emit(EventTopicEnum.componentUnHovering, componentId);
        };

        return {
          observe() {
            componentHost.addEventListener('mouseenter', componentMouseenterHandler);
            componentHost.addEventListener('mouseleave', componentMouseleaveHandler);
          },
          disconnect() {
            componentHost.removeEventListener('mouseenter', componentMouseenterHandler);
            componentHost.removeEventListener('mouseleave', componentMouseleaveHandler);
          },
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
          },
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

    useEffect(() => {
      if (activeComponentId === componentId) {
        event.emit(EventTopicEnum.componentActiving, componentId);
        activeEventFlag.current = true;
        // 激活事件延后一些,为了让取消激活事件先发出
        setTimeout(() => {
          const evt = new CustomEvent('editor-event:active-component', { bubbles: true });
          componentRootRef.current.dispatchEvent(evt);
        }, 80);
      } else if (activeEventFlag.current) {
        const evt = new CustomEvent('editor-event:cancel-active-component', { bubbles: true });
        componentRootRef.current.dispatchEvent(evt);
        activeEventFlag.current = false;
      }
    }, [activeComponentId]);

    return (
      <div
        className={classnames(
          'dynamic-component',
          'editor-dynamic-component',
          {
            'editor-dynamic-component--active': activeComponentId === componentId,
          },
        )}
        data-dynamic-component={componentId}
        data-dynamic-component-type={conf.type}
        style={props.style}
        ref={componentHostRef}
      >
        <div className='toolbar-intersecting-flag' ref={toolbarIntersectingFlagRef} />
        <div className='dragdrop-placeholder-flag' />
        <div className='presentation-flag presentation-flag__activated-state' />
        <div className='presentation-flag presentation-flag__hovering-state' />
        <div className='dragging-preview-flag' />
        {/* 别在把其他辅助节点加在Component后面,因为设计器会根据最后一个节点获取动态组件根节点dom */}
        <Component {...props} />
      </div>
    );
  });

  wrapper.displayName = 'EditorUIEffectWrapper';

  return wrapper;
};

const DynamicComponentValidate = (Component: ComponentType<IDynamicComponentProps>) => {

  const wrapper: React.FC<IDynamicComponentProps> = observer(props => {
    const { store } = useContext(EditorContext);
    const isDynamicComponent = store.structure.checkIsComponent(props.configuration.id);
    return (
      <>
        {isDynamicComponent ? (
          <Component {...props} />
        ) : (
          <div>该配置不是动态组件结构,请添加插槽配置或者取消使用DynamicComponent</div>
        )}
      </>
    );
  });
  wrapper.displayName = 'DynamicComponentValidate';
  return wrapper;
};