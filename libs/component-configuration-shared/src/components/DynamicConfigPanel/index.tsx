import { IComponentConfigurationPanelProps } from '@lowcode-engine/core';
import { FormBuilder, IFormMetadata } from '@lowcode-engine/dynamic-form';
import { ComponentSetterPanelContext, EditorContext, ISetterPanelContext } from '@lowcode-engine/editor';
import { Empty } from 'antd';
import React, { memo, useContext, useEffect, useState } from 'react';
import { IFormMetadataGenerator, IMetadataRegister } from '../../models';
import styles from './index.module.less';
import * as _ from 'lodash';

function getMetadataRegeditKey(context: Partial<ISetterPanelContext>) {
  let key = `type:${context.type}`;
  if (context.parentType) {
    key += `/parentType:${context.parentType}`;
  }
  if (context.rootType) {
    key += `/rootType:${context.rootType}`;
  }
  if (context.slot) {
    key += `/slot:${context.slot}`;
  }
  return key;
};

export async function DynamicConfigPanelLoader(type: string, loader: () => Promise<{ default: IMetadataRegister }>) {

  const metadataRegistry = new Map<string, IFormMetadataGenerator>();
  const register = (context: ISetterPanelContext, generator: IFormMetadataGenerator) => {
    const key = getMetadataRegeditKey(context);
    metadataRegistry.set(key, generator);
  };

  const getMetdata = (context: Partial<ISetterPanelContext>) => {
    const key = getMetadataRegeditKey(context);
    return metadataRegistry.get(key);
  };

  try {
    const module = await loader();
    if (module && _.isFunction(module.default)) {
      module.default(register);
    }
  } catch (err) {
    console.error(`组件配置面板元数据获取出现异常:`, err);
  }

  const DynamicConfigPanel: React.FC<IComponentConfigurationPanelProps> = memo(props => {

    const { value, onChange } = props;
    const panelContext = useContext(ComponentSetterPanelContext);
    const editorContext = useContext(EditorContext);
    const [metadata, setMetadata] = useState<IFormMetadata>();
    const [metadataLoaded, setMetadataLoaded] = useState<boolean>();

    useEffect(() => {
      (async () => {
        // 先找最精确匹配的设置面板,如果找不到然后逐次降低优先级
        const matchedFilters = (function* () {
          yield panelContext;
          yield { type: panelContext.type, parentType: panelContext.parentType, rootType: panelContext.rootType };
          yield { type: panelContext.type, parentType: panelContext.parentType, slot: panelContext.slot };
          yield { parentType: panelContext.parentType, slot: panelContext.slot, rootType: panelContext.rootType };
          yield { type: panelContext.type, rootType: panelContext.rootType };
          yield { type: panelContext.type, parentType: panelContext.parentType };
          yield { parentType: panelContext.parentType, rootType: panelContext.rootType };
          yield { type: panelContext.type, slot: panelContext.slot };
          yield { slot: panelContext.slot, rootType: panelContext.rootType };
          yield { type: panelContext.type };
        })();

        let metaGenerator: IFormMetadataGenerator;
        for (const f of matchedFilters) {
          metaGenerator = getMetdata(f);
          if (metaGenerator) {
            break;
          }
        }

        if (!metaGenerator) {
          setMetadata(null);
          setMetadataLoaded(true);
          return;
        }
        const md = await metaGenerator(editorContext);
        setMetadata(md);
        setMetadataLoaded(true);
      })();
    }, [panelContext]);

    useEffect(() => {
      return () => {
        metadataRegistry.clear();
      };
    }, []);

    return (
      <div className={styles['dynamic-config-panel']}>
        {metadata && (
          <FormBuilder metadata={metadata} value={value} onChange={onChange} />
        )}
        {metadataLoaded && !metadata && (
          <div className={styles['empty-form-placeholder']}>
            <Empty description='没有注册动态表单元数据' />
          </div>
        )}
      </div>
    );

  });

  DynamicConfigPanel.displayName = 'DynamicConfigPanel';

  return { default: DynamicConfigPanel };
}
