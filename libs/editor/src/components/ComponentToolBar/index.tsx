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
    // console.log(`componentIntersecting:`, componentIntersecting);
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

  public reposition(): void {
    const componentHost = this.dom.getComponentHost(this.activeComponentId);
    if (!componentHost || !this.host) { return; }
    let rect = componentHost.getBoundingClientRect();
    this.host.style.top = `${rect.top}px`;
    this.host.style.left = `${rect.left + rect.width}px`;
  }

}

// Wrapper层应该是很纯粹dom交互的一层,不需要通过observer进行监听
export const ComponentToolBarWrapper: React.FC = memo(() => {
  const { event, dom } = useContext(EditorContext);
  const wrapperRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const subs = new SubSink();
    const toolbar = new ToolBar(wrapperRef.current, dom);
    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.toolbarIntersectingChange))
      .pipe(map(evt => evt.data))
      .subscribe((data: { componentId: string, intersecting: boolean }) => {
        toolbar.setIntersecting(data.componentId, data.intersecting);
      });

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.componentStartDragging))
      .subscribe(() => {
        toolbar.toggleStatus(false);
      });

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.sizeConfigurationUpdate))
      .subscribe(() => {
        toolbar.reposition();
      });

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.componentEndDragging))
      // 需要延迟一下,因为toolbarIntersectingChange需要点时间
      .pipe(delay(80))
      .subscribe(() => {
        toolbar.toggleStatus(true);
      });

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.componentActiving), filter(evt => evt.data))
      .pipe(map(evt => evt.data))
      .subscribe((componentId: string) => {
        toolbar.active(componentId);
      });

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.componentContainerScrollStart))
      .subscribe(() => toolbar.toggleStatus(false));

    subs.sink = event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.componentContainerScrollEnd))
      .subscribe(() => toolbar.toggleStatus(true));

    // 设计器可视区域窗口大小调整事件监听器
    const resizeDetector = (() => {
      let lastResizeAt = Date.now();
      let resizeTimeout = null;
      let isFirst = true;
      const resizeDetecting = () => {
        if (isFirst) {
          isFirst = false;
          return;
        }
        if (Date.now() - lastResizeAt > 100) {
          toolbar.toggleStatus(false);
        }

        lastResizeAt = Date.now()
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }

        resizeTimeout = setTimeout(function () {
          if (Date.now() - lastResizeAt > 99) {
            toolbar.toggleStatus(true);
          }
        }, 100);
      }

      const resizeObs = new ResizeObserver(() => resizeDetecting());
      return {
        observe() {
          resizeObs.observe(document.body);
        },
        disconnect() {
          resizeObs.disconnect();
        }
      };
    })();

    resizeDetector.observe();
    return () => {
      subs.unsubscribe();
      resizeDetector.disconnect();
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
