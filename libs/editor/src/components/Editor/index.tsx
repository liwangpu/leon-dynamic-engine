import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { getSnapshot, IDisposer, onAction } from 'mobx-state-tree';
import * as _ from 'lodash';
import { EditorContextManager, IEditorContext, IPlugin, IPluginRegister } from '../../models';
import { EditorContext } from '../../contexts';
import Banner from '../Banner';
import PluginPanel from '../PluginPanel';
import { _Renderer } from '@tiangong/renderer';
import PagePresentation from '../PagePresentation';
import { ComponentDiscoveryContext, IComponentPackage } from '@tiangong/core';
import ComponentSettingPanel from '../ComponentSettingPanel';
import { EditorStoreModel } from '../../store';
import { combineLatest, combineLatestWith, filter, first, map, switchMap } from 'rxjs';
import { EventTopicEnum } from '../../enums';

export interface IEditorProps {
  packages: Array<IComponentPackage>;
  plugins?: Array<IPluginRegister>;
};

export const Editor: React.FC<IEditorProps> = memo(observer(props => {

  const [initialized, setInitialized] = useState(false);
  const editor = useMemo<IEditorContext>(() => {
    const cxt = new EditorContextManager(props.packages);
    return cxt;
  }, []);

  useEffect(() => {
    // if (!initialized) { return; }
    // const subscription = editor.event.message
    //   // .pipe(filter(evt => evt.topic === EventTopicEnum.componentDomInit))
    //   .subscribe(evt => {
    //     console.log(`topic:`, evt.topic, evt.data);
    //     // console.log(`init:`, evt.data);
    //   });
    // const subscription = editor.event.message
    //   .pipe(filter(evt => evt.topic === EventTopicEnum.resetStore), map(evt => evt.data as { activeComponentId: string }))
    //   .pipe(switchMap(({ activeComponentId }) => {
    //     return editor.event.message.pipe(filter(evt => evt.topic === EventTopicEnum.componentDomInit && evt.data === activeComponentId), first()).pipe(map(evt => evt.data))
    //   }))
    //   .subscribe(activeComponentId => {
    //     console.log(`activeComponentId:`, activeComponentId);
    //     console.log(`dom:`,editor.dom.getComponentHost(activeComponentId));
    //   });

    // combineLatest([

    // ])

    // const disposer = onAction(editor.store, act => {
    //   if (act.name !== 'setState') { return; }
    //   // console.log(`act:`, act);
    //   // console.log(`active:`, editor.store.interactionStore.activeComponentId);
    //   // editor.event.emit(EventTopicEnum.resetStore, { activeComponentId: editor.store.interactionStore.activeComponentId });
    //   // console.log(`path:`, act.path, typeof act.path, act.path === '');
    //   // console.log(`name:`, act.name);


    // }, true);

    return () => {
      // disposer();
      // subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const plugins: Array<IPlugin> = [];
    for (let pluginRegister of props.plugins) {
      const plugin = pluginRegister(editor);
      plugins.push(plugin);
    }

    (async () => {
      for (let plugin of plugins) {
        await plugin.init();
      }
      setInitialized(true);
    })();

    return () => {
      setInitialized(false);
      plugins.forEach(plugin => {
        if (_.isFunction(plugin.destroy)) {
          plugin.destroy();
        }
      });
    };
  }, [props.plugins]);

  return (
    <EditorContext.Provider value={editor}>
      {initialized && (
        <ComponentDiscoveryContext.Provider value={editor.componentDiscovery}>
          <div className={styles['editor']}>
            <div className={styles['plugin-container']}>
              <PluginPanel />
            </div>
            <div className={styles['editor__content']}>
              <div className={styles['content-top-part']}>
                <Banner />
              </div>
              <div className={styles['content-bottom-part']}>
                <div className={styles['renderer-container']}>
                  <div className={styles['renderer-container__wrapper']}>
                    <PagePresentation />
                  </div>
                </div>
                <div className={styles['setter-container']}>
                  <ComponentSettingPanel />
                </div>
              </div>
            </div>
          </div>
        </ComponentDiscoveryContext.Provider>
      )}
    </EditorContext.Provider >
  );
}));

Editor.displayName = 'Editor';