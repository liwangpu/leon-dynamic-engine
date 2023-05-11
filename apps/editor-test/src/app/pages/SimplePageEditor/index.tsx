import React, { memo, useContext, useMemo } from 'react';
import styles from './index.module.less';
import { Editor, IPluginRegister } from '@lowcode-engine/editor';
import { ComponentGalleryPluginRegister, ComponentToolBarRegister, HierarchyIndicatorRegister, SchemaViewerPluginRegister } from '@lowcode-engine/primary-plugin';
import { ComponentPackageContext } from '../../contexts';
import { ComponentTypes, RegisterSetter as RegisterPrimarySetter } from '@lowcode-engine/primary-component-package';
import { RegisterSetter as RegisterSharedSetter } from '@lowcode-engine/component-configuration-shared';
import * as _ from 'lodash';
import { IProjectSchema } from '@lowcode-engine/core';
import { ComponentTypes as VideoPlayerComponentTypes } from '../../video-player';
import { generateListPageConfig } from '../../utils';

RegisterPrimarySetter();
RegisterSharedSetter();

const PageEditorComponent: React.FC = memo(() => {

  const packages = useContext(ComponentPackageContext);

  const plugins = useMemo<Array<IPluginRegister>>(() => {
    return [
      // 文档模型注册插件
      ({ project }) => {
        return {
          init() {
            project.import(SimpleSchemaStore.query());
            // console.log(`title:`,SimpleSchemaStore.query());
          }
        };
      },
      // 组件库注册插件
      ComponentGalleryPluginRegister([
        {
          title: '容器',
          components: [
            ComponentTypes.block,
            ComponentTypes.tabs,
          ]
        },
        {
          title: '数据容器',
          components: [
            ComponentTypes.table,
          ]
        },
        {
          title: '表单项',
          components: [
            ComponentTypes.text,
            ComponentTypes.textarea,
            ComponentTypes.number,
          ]
        },
        {
          title: '按钮',
          components: [
            ComponentTypes.button,
            ComponentTypes.buttonGroup,
          ]
        },
        {
          title: '其他',
          components: [
            VideoPlayerComponentTypes.videoPlayer
          ]
        }
      ]),
      // schema源码插件
      SchemaViewerPluginRegister(),
      // 路径组件注册插件
      HierarchyIndicatorRegister(),
      // 工具栏插件
      ComponentToolBarRegister({
        [ComponentTypes.listPage]: [],
        [ComponentTypes.detailPage]: [],
        [ComponentTypes.tableSerialNumberColumn]: [],
        [ComponentTypes.tableSelectionColumn]: [],
        [ComponentTypes.tableOperatorColumn]: [],
        [ComponentTypes.pagination]: [],
      }),
    ];
  }, []);

  return (
    <div className={styles['page']}>
      <Editor packages={packages} plugins={plugins} />
    </div>
  );
});

PageEditorComponent.displayName = 'SimplePageEditorComponent';

export default PageEditorComponent;

const SimpleSchemaStore = (() => {

  const STORAGE_KEY = 'simple-page-editor-schema';

  const INITIAL_SCHEMA: IProjectSchema = generateListPageConfig();

  return {
    query() {
      const str = localStorage.getItem(STORAGE_KEY);
      if (str) {
        return JSON.parse(str);
      }

      return INITIAL_SCHEMA;
    },
    save(schema: IProjectSchema) {
      if (!schema) { return; }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schema))
    }
  };
})();