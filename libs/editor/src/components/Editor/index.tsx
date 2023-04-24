import { forwardRef, memo, useContext, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import styles from './index.module.less';
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

export interface IEditorRef {
  getContext(): IEditorContext;
}

export const Editor = memo(forwardRef<IEditorRef, IEditorProps>((props, ref) => {

  const [initialized, setInitialized] = useState(false);
  const collocationContext = useContext(DataStoreCollocationContext);
  const editor = useMemo<IEditorContext>(() => new EditorContextManager(props.packages), [props.plugins]);

  useImperativeHandle(ref, () => ({
    getContext() {
      return editor;
    },
  }), [editor]);

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
      const slotInfo = await editor.componentDiscovery.queryComponentSlotInfo();
      editor.slot.registerMap(slotInfo);

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
}));

Editor.displayName = 'Editor';