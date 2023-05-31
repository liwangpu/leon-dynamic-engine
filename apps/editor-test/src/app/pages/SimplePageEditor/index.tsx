import React, { memo, useCallback, useMemo } from 'react';
import styles from './index.module.less';
import { Editor, EditorPluginRegister, SkeletonAreaEnum } from '@lowcode-engine/editor';
import { ComponentGalleryPluginRegister, ComponentToolBarRegister, HierarchyIndicatorRegister } from '@lowcode-engine/primary-plugin';
import { ComponentTypes, RegisterSetter as RegisterPrimarySetter } from '@lowcode-engine/primary-component-package';
import { RegisterSetter as RegisterSharedSetter } from '@lowcode-engine/component-configuration-shared';
import * as _ from 'lodash';
import { ComponentTypes as VideoPlayerComponentTypes } from '../../packages/video-player';
import { ComponentTypes as ImageViewerComponentTypes } from '../../packages/image-viewer';
import LowcodeInfrastructureComponent from '../../components/LowcodeInfrastructure';
import { Button, notification } from 'antd';
import { ClearOutlined, SaveOutlined } from '@ant-design/icons';
import { LocalShemaStore } from './local-schema-store';
import { ConfigurationAddingEffectPluginRegister } from './plugins';

RegisterPrimarySetter();
RegisterSharedSetter();

const PageEditorComponent: React.FC = memo(() => {

  const showMessage = useCallback((msg?: string) => {
    notification.open({
      message: '温馨提示',
      description:
        msg || '数据保存成功',
      placement: 'bottomRight',
      duration: 2.5
    });
  }, []);

  const plugins = useMemo<Array<EditorPluginRegister>>(() => {
    return [
      // 文档模型注册插件
      ({ project }) => {
        return {
          init() {
            const schema = LocalShemaStore.query();
            // console.log(`import schema:`, schema);
            project.import(schema);
          }
        };
      },
      // 组件添加副作用注册插件
      ConfigurationAddingEffectPluginRegister(),
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
          title: '按钮',
          components: [
            ComponentTypes.button,
            ComponentTypes.buttonGroup,
          ]
        },
        {
          title: '其他',
          components: [
            VideoPlayerComponentTypes.videoPlayer,
            ImageViewerComponentTypes.imageViewer,
          ]
        }
      ]),
      // // schema源码插件
      // SchemaViewerPluginRegister(),
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
      // 顶部按钮注册插件
      ({ skeleton, project }) => {
        const skeletonKey = 'PAGE_OPERATION_ST';
        return {
          init() {
            const saveSchema = () => {
              const schema = project.export();
              // console.log(`save schema:`, schema);
              LocalShemaStore.save(schema);
              showMessage('保存成功');
            };

            const clearSchema = () => {
              LocalShemaStore.reset();
              const schema = LocalShemaStore.query();
              project.import(schema);
            };

            skeleton.add({
              key: skeletonKey,
              area: SkeletonAreaEnum.topRightArea,
              content: (
                <div className={styles['editor-operation']}>
                  <Button type="primary" danger icon={<ClearOutlined />} onClick={clearSchema} >清空</Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={saveSchema} >保存</Button>
                </div >
              )
            });
          },
          destroy: async () => {
            skeleton.remove(skeletonKey);
          }
        };
      },
    ];
  }, []);

  return (
    <div className={styles['page']}>
      <LowcodeInfrastructureComponent>
        {({ packages }) => (<Editor packages={packages} plugins={plugins} />)}
      </LowcodeInfrastructureComponent>
    </div>
  );
});

PageEditorComponent.displayName = 'SimplePageEditorComponent';

export default PageEditorComponent;


