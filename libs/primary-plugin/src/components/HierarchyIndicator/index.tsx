import { EditorContext } from '@lowcode-engine/editor';
import { observer } from 'mobx-react-lite';
import React, { memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, MouseEvent } from 'react';
import styles from './index.module.less';
import * as _ from 'lodash';
import classnames from 'classnames';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const BUTTON_DISABLED_CLASS = styles['button-disabled'];

export interface IHierarchyIndicatorProps {
  typeIgnores?: Array<string>;
}

const HierarchyIndicator: React.FC<IHierarchyIndicatorProps> = observer(({ typeIgnores }) => {

  const { store } = useContext(EditorContext);
  const { interactionStore } = store;
  const { activeComponentId } = interactionStore;
  const hierarchyList = store.selectHierarchyList(activeComponentId, typeIgnores);

  const onHierarchyActive = (id: string) => {
    interactionStore.activeComponent(id);
  };

  return (
    <HierarchyScrollbar hierachyList={hierarchyList} onHierarchyActive={onHierarchyActive} />
  );
});

HierarchyIndicator.displayName = 'HierarchyIndicator';

export default HierarchyIndicator;

interface IHierarchyData {
  id: string;
  title: string;
  type: string;
}

interface IHierarchyScrollbarProps {
  hierachyList: Array<IHierarchyData>;
  onHierarchyActive(id: string): void;
}

const HierarchyScrollbar: React.FC<IHierarchyScrollbarProps> = memo(props => {

  const scrollTrackRef = useRef<HTMLDivElement>();
  const leftScrollButtonRef = useRef<HTMLDivElement>();
  const rightScrollButtonRef = useRef<HTMLDivElement>();
  const leftVisibleIndicatorRef = useRef<HTMLDivElement>();
  const rightVisibleIndicatorRef = useRef<HTMLDivElement>();

  const scrollToLeft = (e: MouseEvent) => {
    e.stopPropagation();
    const scrollTrack = scrollTrackRef.current;
    scrollTrack.scrollBy({ left: -scrollTrack.clientWidth / 2, behavior: "smooth" });
  };

  const scrollToRight = (e: MouseEvent) => {
    e.stopPropagation();
    const scrollTrack = scrollTrackRef.current;
    scrollTrack.scrollBy({ left: scrollTrack.clientWidth / 2, behavior: "smooth" });
  };

  const scrollToEnd = () => {
    const scrollTrack = scrollTrackRef.current;
    if (!scrollTrack) { return; }
    if (scrollTrack.scrollWidth > scrollTrack.clientWidth) {
      scrollTrack.scrollTo({ left: scrollTrack.scrollWidth, behavior: 'smooth' });
    }
  };

  const onHierarchyActive = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    props.onHierarchyActive(id);
  };

  const RenderTrack = useMemo(() => {
    if (!props.hierachyList && !props.hierachyList.length) { return null; }
    return props.hierachyList.map((item, idx, arr) => (
      <div className={classnames(
        styles['hierachy-node'],
        {
          [styles['hierachy-node--last']]: arr.length - 1 === idx
        }
      )} key={item.id}>
        <p className={styles['hierachy-node__title']} title={item.title} onClick={(e) => onHierarchyActive(item.id, e)}>{item.title}</p>
      </div>
    ));
  }, [props.hierachyList]);

  useLayoutEffect(() => {

    const scrollbarIntersectingDetector = (() => {
      const toggleScrollbar = (entries: Array<IntersectionObserverEntry>) => {
        const entry: IntersectionObserverEntry = entries[0];
        const target: HTMLDivElement = entry.target as any;
        const visible = entry.isIntersecting === true;
        const indicatorDirection = target.getAttribute('data-indicator-direction');
        const scrollbar = indicatorDirection === 'left' ? leftScrollButtonRef.current : rightScrollButtonRef.current;
        if (!scrollbar) { return; }
        if (visible) {
          if (!scrollbar.classList.contains(BUTTON_DISABLED_CLASS)) {
            scrollbar.classList.add(BUTTON_DISABLED_CLASS);
          }
        } else {
          if (scrollbar.classList.contains(BUTTON_DISABLED_CLASS)) {
            scrollbar.classList.remove(BUTTON_DISABLED_CLASS);
          }
        }
      };

      const leftVisibleIndicatorIntersectingObs = new IntersectionObserver(entries => {
        toggleScrollbar(entries);
      }, {});

      const rightVisibleIndicatorIntersectingObs = new IntersectionObserver(entries => {
        toggleScrollbar(entries);
      }, {});

      return {
        observe() {
          leftVisibleIndicatorIntersectingObs.observe(leftVisibleIndicatorRef.current);
          rightVisibleIndicatorIntersectingObs.observe(rightVisibleIndicatorRef.current);
        },
        disconnect() {
          leftVisibleIndicatorIntersectingObs.disconnect();
          rightVisibleIndicatorIntersectingObs.disconnect();
        },
      };
    })();

    const bodyResizeDetector = (() => {
      let lastResizeAt = Date.now();
      let resizeTimeout = null;
      let isFirst = true;
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
          if (Date.now() - lastResizeAt > 99) {
            scrollToEnd();
          }
        }, 120);
      };

      const obs: ResizeObserver = new ResizeObserver(() => resizeDetecting())
      return {
        observe() {
          obs.observe(document.body);
        },
        disconnect() {
          obs.disconnect();
        },
      };
    })();

    scrollbarIntersectingDetector.observe();
    bodyResizeDetector.observe();

    return () => {
      scrollbarIntersectingDetector.disconnect();
      bodyResizeDetector.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    scrollToEnd();
  }, [props.hierachyList]);

  return (
    <div className={styles['scrollbar']}>
      <div className={styles['scrollbar__button']} onClick={scrollToLeft} ref={leftScrollButtonRef}>
        <LeftOutlined />
      </div>
      <div className={styles['scrollbar__track']} ref={scrollTrackRef}>
        <div className={styles['visible-indicator']} ref={leftVisibleIndicatorRef} data-indicator-direction='left' />
        {RenderTrack}
        <div className={styles['visible-indicator']} ref={rightVisibleIndicatorRef} data-indicator-direction='right' />
      </div>
      <div className={styles['scrollbar__button']} onClick={scrollToRight} ref={rightScrollButtonRef}>
        <RightOutlined />
      </div>
    </div>
  );
});

HierarchyScrollbar.displayName = 'HierarchyScrollbar';
