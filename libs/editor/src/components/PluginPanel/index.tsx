import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { useContext, useMemo, useState } from 'react';
import { EditorContext, ILeftAreaPluginContext, LeftAreaPluginContext } from '../../contexts';
import React from 'react';
import classnames from 'classnames';
import { EventTopicEnum, SkeletonAreaEnum } from '../../enums';

const PluginPanel: React.FC = observer(() => {

  const { skeleton, event } = useContext(EditorContext);
  const skeletonGroupOfLeftArea = skeleton.skeletonGroup[SkeletonAreaEnum.leftArea];
  const skeletonNames = skeletonGroupOfLeftArea && skeletonGroupOfLeftArea.size > 0 ? Array.from(skeletonGroupOfLeftArea) : [];
  const firstPanelName = skeletonNames[0];
  const [activePanel, setActivePanel] = useState<string>(firstPanelName);
  const panelRefMap = useMemo<Map<string, HTMLElement>>(() => new Map(), [skeletonGroupOfLeftArea]);
  const visiblePanels = useMemo<string[]>(() => {
    const panels: string[] = [];
    if (firstPanelName) {
      panels.push(firstPanelName);
    }
    return panels;
  }, [skeletonGroupOfLeftArea]);
  const [Icons, Panels] = useMemo(() => {
    if (!skeletonGroupOfLeftArea?.size) { return []; }
    const _Icons = skeletonNames.map(n => {
      const IconElement = skeleton.skeletonMap.get(n).icon;
      const title = skeleton.skeletonMap.get(n).title;
      return (
        <div key={n} className={classnames(
          styles['nav'],
          {
            [styles['nav--active']]: n === activePanel
          }
        )} onClick={() => handleActivePanel(n)}>
          <div className={
            classnames(
              styles['nav__icon'],
              {
                [styles['nav__icon--active']]: n === activePanel
              }
            )
          }>
            {IconElement}
          </div>
          {title && (
            <div className={styles['nav__title']}>
              {title}
            </div>
          )}
        </div>
      )
    });

    const _Panels = visiblePanels.map(n => (
      <div key={n} className={styles['panel']} ref={(e: any) => addToRefs(n, e)}>
        {skeleton.skeletonMap.get(n)?.content}
      </div>
    ));
    return [_Icons, _Panels];
  }, [skeletonGroupOfLeftArea, activePanel]);
  const leftAreaPluginCtx = useMemo<ILeftAreaPluginContext>(() => {
    return {
      close() {
        console.log(`close:`, activePanel);
        // setActivePanel(null);
        handleActivePanel();
      }
    };
  }, [skeletonGroupOfLeftArea]);
  const handleActivePanel = (name?: string) => {
    // debugger;
    if (activePanel === name) {
      name = null;
    }
    visiblePanels.forEach(pName => {
      if (pName !== name && panelRefMap.has(pName)) {
        const pEl = panelRefMap.get(pName);
        pEl.classList.add(styles['panel--hidden']);
      }
    });
    setActivePanel(name);
    if (name) {
      if (!visiblePanels.includes(name)) {
        visiblePanels.push(name);
      } else {
        if (panelRefMap.has(name)) {
          const pEl = panelRefMap.get(name);
          pEl.classList.remove(styles['panel--hidden']);
        }
      }
    }
    event.emit(EventTopicEnum.pluginPanelActiving, name);
  };

  const addToRefs = (key: string, el: HTMLElement) => {
    if (!panelRefMap.has(key)) {
      panelRefMap.set(key, el);
    }
  };

  return (
    <div className={styles['plugin-panel']}>
      <div className={styles['plugin-panel__sidebar']}>
        {Icons}
      </div>
      <div className={styles['plugin-panel__content']}>
        <LeftAreaPluginContext.Provider value={leftAreaPluginCtx}>
          {Panels}
        </LeftAreaPluginContext.Provider>
      </div>
    </div>
  );
});

PluginPanel.displayName = 'PluginPanel';

export default PluginPanel;
