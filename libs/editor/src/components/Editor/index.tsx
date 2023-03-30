import React, { useContext, useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import * as _ from 'lodash';
import { EditorContextManager, IEditorContext, IPlugin, IPluginRegister } from '../../models';
import { DataStoreCollocationContext, EditorContext } from '../../contexts';
import Banner from '../Banner';
import PluginPanel from '../PluginPanel';
import PagePresentation from '../PagePresentation';
import { ComponentDiscoveryContext, IComponentPackage } from '@lowcode-engine/core';
import ComponentSettingPanel from '../ComponentSettingPanel';
import { PagePresentationFooterAreaPanel } from '../PagePresentationFooterAreaPanel';

export interface IEditorProps {
  packages: Array<IComponentPackage>;
  plugins?: Array<IPluginRegister>;
};

export const Editor: React.FC<IEditorProps> = observer(props => {

  const [initialized, setInitialized] = useState(false);
  const collocationContext = useContext(DataStoreCollocationContext);
  const editor = useMemo<IEditorContext>(() => {
    const cxt = new EditorContextManager(props.packages);
    return cxt;
  }, []);

  useEffect(() => {
    if (collocationContext) {
      collocationContext.hosting(editor.store);
    }
    const plugins: Array<IPlugin> = [];
    for (const pluginRegister of props.plugins) {
      const plugin = pluginRegister(editor);
      plugins.push(plugin);
    }

    (async () => {
      for (const plugin of plugins) {
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
            <div className={styles['editor__header']}>
              <Banner />
            </div>
            <div className={styles['editor__content']}>
              <div className={styles['plugin-container']}>
                <PluginPanel />
              </div>
              <div className={styles['renderer-container']}>
                <div className={styles['renderer-container__content']}>
                  <div className={styles['content-wrapper']}>
                    <PagePresentation />
                  </div>
                </div>
                <div className={styles['renderer-container__footer']}>
                  <PagePresentationFooterAreaPanel />
                </div>
              </div>
              <div className={styles['setter-container']}>
                <ComponentSettingPanel />
              </div>
            </div>
          </div>
        </ComponentDiscoveryContext.Provider>
      )}
    </EditorContext.Provider >
  );
});

Editor.displayName = 'Editor';