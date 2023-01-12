import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { memo, useContext, useMemo, useState } from 'react';
import { EditorContext } from '../../contexts';
import React from 'react';
import classnames from 'classnames';
import { SkeletonAreaEnum } from '../../enums';

const PluginPanel: React.FC = memo(observer(() => {

  const { skeleton } = useContext(EditorContext);
  const skeletonGroupOfLeftArea = skeleton.skeletonGroup[SkeletonAreaEnum.leftArea];
  const skeletonGroupOfTopArea = skeleton.skeletonGroup[SkeletonAreaEnum.pluginTopArea];
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
    const _Icons = skeletonNames.map(n => (
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
          {skeleton.skeletonMap.get(n)?.icon}
        </div>
      </div>
    ));

    const _Panels = visiblePanels.map(n => (
      <div key={n} className={styles['panel']} ref={(e: any) => addToRefs(n, e)}>
        {skeleton.skeletonMap.get(n)?.content}
      </div>
    ));
    return [_Icons, _Panels];
  }, [skeletonGroupOfLeftArea, activePanel]);

  const TopAreaSkeleton = useMemo(() => {
    if (!skeletonGroupOfTopArea?.size) { return null; }
    return [...skeletonGroupOfTopArea.values()].map(n => (
      <React.Fragment key={n}>
        {skeleton.skeletonMap.get(n)?.content}
      </React.Fragment>
    ));
  }, [skeletonGroupOfTopArea]);

  const handleActivePanel = (name: string) => {
    visiblePanels.forEach(pName => {
      if (pName !== name && panelRefMap.has(pName)) {
        const pEl = panelRefMap.get(pName);
        pEl.classList.add(styles['panel--hidden']);
      }
    });
    if (!visiblePanels.includes(name)) {
      visiblePanels.push(name);
    } else {
      if (panelRefMap.has(name)) {
        const pEl = panelRefMap.get(name);
        pEl.classList.remove(styles['panel--hidden']);
      }
    }

    setActivePanel(name);
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
        <div className={styles['panel-top-area']}>
          {TopAreaSkeleton}
        </div>
        {Panels}
      </div>
    </div>
  );
}));

PluginPanel.displayName = 'PluginPanel';

export default PluginPanel;
