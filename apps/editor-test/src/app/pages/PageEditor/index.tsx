import React, { memo, useCallback, useMemo, useRef } from 'react';
import styles from './index.module.less';
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { Editor, IEditorRef, IPluginRegister, SkeletonAreaEnum } from '@lowcode-engine/editor';
import { ComponentGalleryPluginRegister, ComponentToolBarRegister, HierarchyIndicatorRegister, IBusinessModel, ModelGalleryPluginRegister, SchemaViewerPluginRegister } from '@lowcode-engine/primary-plugin';
import { ComponentTypes, RegisterSetter as RegisterPrimarySetter } from '@lowcode-engine/primary-component-package';
import { RegisterSetter as RegisterSharedSetter } from '@lowcode-engine/component-configuration-shared';
import { Button, Modal, notification } from 'antd';
import * as _ from 'lodash';
import { ArrowLeftOutlined, ClearOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons';
import { IProjectSchema } from '@lowcode-engine/core';
import { ModelRepository, PageRepository } from '../../models';
import LowcodeInfrastructureComponent from '../../components/LowcodeInfrastructure';
import { useComponentConfigGenerator } from '../../hooks';
import { ComponentSlotMapPluginRegister, ConfigurationAddingEffectPluginRegister, ConfigurationDeleteEffectPluginRegister, ConfigurationSelectorPluginRegister, ConfigurationTypeTransferEffectPluginRegister } from './plugins';

const { confirm } = Modal;

RegisterPrimarySetter();
RegisterSharedSetter();

const PageEditor: React.FC = memo(() => {

  const { pageId, businessModel } = useParams();
  const { schema } = useLoaderData() as { model: IBusinessModel, schema: IProjectSchema };
  const schemaRef = useRef<IProjectSchema>(schema);
  const editorRef = useRef<IEditorRef>();
  const navigate = useNavigate();
  const confGenerator = useComponentConfigGenerator();

  const getCurrentSchema = () => {
    const ctx = editorRef.current.getContext();
    return ctx.project.export();
  };

  const goBack = () => {
    const back = () => {
      if (window.opener != null && !window.opener.closed) {
        window.close();
      } else {
        window.name = null;
        navigate(`/app/business-detail/${businessModel}`);
      }
    };
    // 退出前先看看当前有没有保存
    const lastestSchema = schemaRef.current;
    const currentSchema = getCurrentSchema();
    const persistent = _.isEqual(currentSchema, lastestSchema);
    if (persistent) {
      return back();
    }

    confirm({
      title: '温馨提示',
      content: '页面有修改, 关闭可能使得内容丢失, 确认要关闭？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        back();
      }
    });
  };

  const showMessage = useCallback((msg?: string) => {
    notification.open({
      message: '温馨提示',
      description:
        msg || '数据保存成功',
      placement: 'bottomRight',
      duration: 2.5
    });
  }, []);

  const saveSchema = async () => {
    const s = getCurrentSchema();
    console.log(`schema save:`, s);
    await PageRepository.getInstance().update(s.id, s);
    schemaRef.current = s;
    showMessage();
  };

  const clearSchema = async () => {
    const ctx = editorRef.current.getContext();
    const s = getCurrentSchema();
    const newSchema: IProjectSchema = {
      ...s,
      children: [],
      operators: []
    };
    await PageRepository.getInstance().update(newSchema.id, newSchema);
    schemaRef.current = newSchema;
    ctx.project.import(newSchema);
    showMessage('清空成功');
  };

  const previewPage = useCallback(() => {
    window.open(`/app/page-preview/${businessModel}/${pageId}?showNav=true`, `preview-page@${businessModel}#${pageId}`);
  }, []);

  const plugins = useMemo<Array<IPluginRegister>>(() => {
    return [
      // 组件插槽相关注册插件
      ComponentSlotMapPluginRegister(),
      // 组件添加副作用注册插件
      ConfigurationAddingEffectPluginRegister({ confGenerator }),
      // 组件删除副作用注册插件
      ConfigurationDeleteEffectPluginRegister(),
      // 组件类型转换副作用注册插件
      ConfigurationTypeTransferEffectPluginRegister(),
      // 组件面板配置数据选择器注册插件
      ConfigurationSelectorPluginRegister(),
      // 文档模型注册插件
      ({ project }) => {
        return {
          init() {
            project.import(schema);
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
      ]),
      // 模型库注册插件
      ModelGalleryPluginRegister(businessModel, id => {
        return ModelRepository.getInstance().get(id);
      }, data => {
        return { type: 'text', title: data.name };
      }),
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
      // 页面返回按钮注册插件
      ({ skeleton }) => {
        const skeletonKey = 'EDITOR_RETURN_ST';
        return {
          init() {
            skeleton.add({
              key: skeletonKey,
              area: SkeletonAreaEnum.topLeftArea,
              content: (
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={goBack} size='small'>返回</Button>
              )
            });
          },
          destroy: async () => {
            skeleton.remove(skeletonKey);
          }
        };
      },
      // 设计器保存按钮区域注册插件
      ({ skeleton }) => {
        const skeletonKey = 'PAGE_OPERATION_ST';
        return {
          init() {
            skeleton.add({
              key: skeletonKey,
              area: SkeletonAreaEnum.topRightArea,
              content: (
                <div className={styles['editor-operation']}>
                  <Button type="primary" danger icon={<ClearOutlined />} onClick={clearSchema} >清空</Button>
                  <Button type="default" icon={<EyeOutlined />} onClick={previewPage} >预览</Button>
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
    <div className={styles['page-editor']}>
      <LowcodeInfrastructureComponent>
        {({ packages }) => (<Editor packages={packages} plugins={plugins} ref={editorRef} />)}
      </LowcodeInfrastructureComponent>
    </div>
  );
});

PageEditor.displayName = 'PageEditor';

export default PageEditor;
