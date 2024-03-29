import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { memo, useContext, useEffect, useRef } from 'react';
import React from 'react';
import { EditorContext } from '../../contexts';
import { SubSink } from 'subsink';
import { delay, filter, map } from 'rxjs';
import { EventTopicEnum, SkeletonAreaEnum } from '../../enums';
import { IDomManager } from '../../models';
import { useAreaSkeleton } from '../../hooks';

const TOOLBAR_WRAPPER_SHOW_CLASS = 'editor-toolbar-wrapper--show';

class ToolBar {

  private activeComponentId: string;
  private readonly componentIntersecting = new Map<string, boolean>();
  constructor(protected host: HTMLDivElement, protected dom: IDomManager) { }

  public active(id: string): void {
    this.activeComponentId = id;
    this.toggleStatus(true);
  }

  public toggleStatus(enabled: boolean): void {
    if (!this.host) { return; }

    if (enabled) {
      if (!this.componentIntersecting.has(this.activeComponentId) || this.componentIntersecting.get(this.activeComponentId)) {
        this.reposition();
        this.host.classList.add(TOOLBAR_WRAPPER_SHOW_CLASS);
      } else {
        this.host.classList.remove(TOOLBAR_WRAPPER_SHOW_CLASS);
      }
    } else {
      this.host.classList.remove(TOOLBAR_WRAPPER_SHOW_CLASS);
    }
  }

  public setIntersecting(id: string, intersecting: boolean): void {
    this.componentIntersecting.set(id, intersecting);
  }

  public removeIntersecting(id: string): void {
    this.componentIntersecting.delete(id);
  }

  public reposition(): void {
    const componentHost = this.dom.getComponentHost(this.activeComponentId);
    if (!componentHost || !this.host) { return; }
    const rect = componentHost.getBoundingClientRect();
    const hostRect = this.host.getBoundingClientRect();
    const distTop = rect.top;
    const distLeft = rect.left + rect.width;
    if (hostRect.top !== distTop || hostRect.left !== distLeft) {
      this.host.style.top = `${distTop}px`;
      this.host.style.left = `${distLeft}px`;
    }
  }

}

// Wrapper层应该是很纯粹dom交互的一层,不需要通过observer进行监听
export const ComponentToolBarWrapper: React.FC = memo(() => {
  const { event, dom } = useContext(EditorContext);
  const wrapperRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const subs = new SubSink();
    const toolbar = new ToolBar(wrapperRef.current, dom);

    let dragging = false;

    // 组件拖拽过程中,不要监听显隐性,因为拖拽过程中会有显隐性变化,而这个变化对于最终结果而已没有意义
    // 而且发现拖拽过程中,intersecting发出了false事件,但是拖拽完毕后并没有发出true事件,有点神奇
    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.toolbarIntersectingChange), filter(() => !dragging))
      .pipe(map(evt => evt.data))
      .subscribe((data: { componentId: string, intersecting: boolean }) => {
        toolbar.setIntersecting(data.componentId, data.intersecting);
      });

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.componentDomDestroy))
      .pipe(map(evt => evt.data))
      .subscribe((componentId: string) => {
        toolbar.removeIntersecting(componentId);
      });

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.componentStartDragging))
      .subscribe(() => {
        dragging = true;
        toolbar.toggleStatus(false);
      });

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.componentEndDragging))
      // 需要延迟一下,因为toolbarIntersectingChange需要点时间
      // 另外,这个时间一定要设置得比拖拽配置的sortablejs animation时间大,否则会出现动画过程中计算位置有误
      .pipe(delay(120))
      .subscribe(() => {
        dragging = false;
        toolbar.toggleStatus(true);
      });

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.componentActiving), filter(evt => evt.data))
      .pipe(map(evt => evt.data))
      .subscribe((componentId: string) => {
        toolbar.active(componentId);
        componentHostResizeDetector.observe(componentId);
      });

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.componentContainerScrollStart))
      .subscribe(() => {
        toolbar.toggleStatus(false);
      });

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.componentContainerScrollEnd))
      .subscribe(() => {
        toolbar.toggleStatus(true);
      });

    const componentHostResizeDetector = (() => {
      let lastResizeAt = Date.now();
      let resizeTimeout = null;
      let isFirst = true;
      const debounceTime = 150;
      const resizeDetecting = () => {
        if (isFirst) {
          isFirst = false;
          return;
        }

        lastResizeAt = Date.now();
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }

        resizeTimeout = setTimeout(() => {
          if (Date.now() - lastResizeAt > (debounceTime - 1)) {
            toolbar.reposition();
          }
        }, debounceTime);
      };

      let obs: ResizeObserver;
      return {
        observe(componentId: string) {
          if (obs) {
            isFirst = true;
            obs.disconnect();
          }
          obs = new ResizeObserver(() => resizeDetecting());
          const host = dom.getComponentHost(componentId);
          obs.observe(host);
        },
        disconnect() {
          if (obs) {
            obs.disconnect();
            obs = null;
          }
        },
      };
    })();

    return () => {
      subs.unsubscribe();
      componentHostResizeDetector.disconnect();
    };
  }, []);

  return (
    <div className='editor-toolbar-wrapper' ref={wrapperRef}>
      <ComponentToolBar />
    </div>
  );
});


const ComponentToolBar: React.FC = observer(() => {
  const { areaSkeleton: ToolBarMenuSkeleton } = useAreaSkeleton(SkeletonAreaEnum.toolbar);

  return (
    <div className={styles['toolbar']}>
      {ToolBarMenuSkeleton}
    </div>
  );
});

ComponentToolBar.displayName = 'ComponentToolBar';
