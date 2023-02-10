import React, { memo, useCallback, useContext, useMemo } from 'react';
import styles from './index.module.less';
import { useLoaderData, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Editor, IPluginRegister, SkeletonAreaEnum } from '@lowcode-engine/editor';
import { ComponentGalleryPluginRegister, IModelFieldNode, ModelGalleryPluginRegister, SchemaViewerPluginRegister } from '@lowcode-engine/primary-plugin';
import { IBusinessIModel, IModelField, ModelRepository } from '../../models';
import PageEditorOperation from '../../components/PageEditorOperation';
import { ComponentPackageContext } from '../../contexts';
import { ComponentTypes, IBlockComponentConfiguration, ITableComponentConfiguration, ITextComponentConfiguration } from '@lowcode-engine/primary-component-package';
import { Button } from 'antd';
import * as _ from 'lodash';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { GenerateShortId, IComponentConfiguration } from '@lowcode-engine/core';
import { GridSystemSection } from '@lowcode-engine/component-configuration-shared';

const buttonTypes: Array<ComponentTypes> = [
  ComponentTypes.button,
  ComponentTypes.buttonGroup
];

const formInputTypes: Array<ComponentTypes> = [
  ComponentTypes.text,
  ComponentTypes.number
];

const PageEditor: React.FC = memo(() => {

  const packages = useContext(ComponentPackageContext);
  const { businessModel } = useParams();
  const [search] = useSearchParams();
  const pageType = search.get('pageType');
  const { model, schema } = useLoaderData() as { model: IBusinessIModel, schema: IComponentConfiguration };
  const navigate = useNavigate();
  const goBack = useCallback(() => {
    navigate(`/app/business-detail/${businessModel}`);
  }, []);

  const plugins = useMemo<Array<IPluginRegister>>(() => {
    // 一些模型相关的数据整理,主要为模型插件使用
    const fieldMap = new Map<string, IModelFieldNode>();
    const model2FieldNodeTransfer = (f: IModelField) => {
      const node: IModelFieldNode = { key: f.id, title: f.title, type: f.type };
      if (f.fields && f.fields.length) {
        f.fields.forEach(subF => model2FieldNodeTransfer(subF));
        node.children = f.fields.map(subF => fieldMap.get(subF.id))
      }
      fieldMap.set(f.id, node);
    };
    model2FieldNodeTransfer(model);

    return [
      // 组件插槽相关注册插件
      (function pageOperationPluginRegistry({ slot }) {
        return {
          init: async () => {
            slot.registerMap({
              [ComponentTypes.detailPage]: {
                children: {
                  rejects: [...buttonTypes, ...formInputTypes]
                },
                operators: {
                  accepts: [...buttonTypes]
                }
              },
              [ComponentTypes.listPage]: {
                children: {
                  rejects: [...buttonTypes, ...formInputTypes]
                },
                operators: {
                  accepts: [...buttonTypes]
                }
              },
              [ComponentTypes.block]: {
                children: {
                  rejects: [...buttonTypes]
                }
              },
              [ComponentTypes.buttonGroup]: {
                children: {
                  accepts: [ComponentTypes.button]
                }
              },
              [ComponentTypes.table]: {
                operators: {
                  accepts: [...buttonTypes]
                },
                columns: {
                  accepts: [...formInputTypes],
                  rejects: [...buttonTypes]
                },
                operatorColumn: {
                  accepts: [...buttonTypes]
                }
              },
            });

            // slot.registerAddingVerification(ComponentTypes.text, async (conf: ITextComponentConfiguration) => {
            //   conf.gridColumnSpan = GridSystemSection['1/2'];
            //   return conf;
            // });

            // slot.registerAddingVerification(ComponentTypes.buttonGroup, async (conf: IComponentConfiguration) => {
            //   // conf.children = [
            //   //   {
            //   //     id: GenerateShortId(),
            //   //     type: ComponentTypes.button,
            //   //     title: '按钮'
            //   //   }
            //   // ];
            //   // conf.height = 'auto';
            //   return conf;
            // });

            // slot.registerAddingVerfication(ComponentTypes.tabs, async (conf: ITabsComponentConfiguration) => {
            //   conf.items = [
            //     {
            //       id: GenerateShortId(),
            //       type: 'tab',
            //       title: '页签1'
            //     }
            //   ];
            //   return conf;
            // });
          }
        };
      }),
      // 组件元数据处理管道注册插件
      (function configAddingHandlerPluginRegistry({ configurationAddingHandler }) {
        return {
          init: async () => {

            configurationAddingHandler.registerHandler({ parentTypeSelector: ComponentTypes.block, typeSelector: [ComponentTypes.text, ComponentTypes.number] }, async (conf) => {
              // eslint-disable-next-line no-param-reassign
              conf.gridColumnSpan = GridSystemSection['1/2'];
              return conf;
            });

            configurationAddingHandler.registerHandler({ typeSelector: null }, async (conf) => {
              // eslint-disable-next-line no-param-reassign
              conf.code = GenerateShortId();
              return conf;
            });
          },
        };
      }),
      // 文档模型注册插件
      (function pageProjectPluginRegistry({ project }) {
        return {
          init: async () => {
            project.import(schema);
          }
        };
      }),
      // 组件库注册插件
      ComponentGalleryPluginRegister([
        {
          title: '容器',
          components: [
            ComponentTypes.block
          ]
        },
        {
          title: '数据容器',
          components: [
            ComponentTypes.table,
            // ComponentTypes.form
          ]
        },
        {
          title: '表单项',
          components: [
            ComponentTypes.text,
            ComponentTypes.number,
          ]
        },
        {
          title: '按钮',
          components: [
            ComponentTypes.button,
            ComponentTypes.buttonGroup
          ]
        }
      ]),
      // 模型库注册插件
      ModelGalleryPluginRegister(async () => {
        return [fieldMap.get(model.id)];
      }, async (id) => {
        const field = fieldMap.get(id);
        const conf: IComponentConfiguration = { type: null, title: field.title };
        // 做字段和组件类型映射
        switch (field.type) {
          case 'reference':
            const currentModel = await ModelRepository.getInstance().get(field.key);
            const fieldComponents = currentModel.fields.map(f => ({ id: GenerateShortId(), type: 'text', title: f.title }));
            switch (pageType) {
              case 'list-page':
                // 列表页面主业务对象引用生成表格
                conf.type = ComponentTypes.table;
                (conf as ITableComponentConfiguration).columns = fieldComponents;
                break;
              case 'detail-page':
                // 详情页主业务对象生成表单
                // 子引用对象生成表格
                if (id === businessModel) {
                  conf.type = ComponentTypes.block;
                  conf.children = fieldComponents;
                  // (conf as IBlockComponentConfiguration).columns = 2;
                } else {
                  conf.type = ComponentTypes.table;
                  (conf as ITableComponentConfiguration).columns = fieldComponents;
                }
                break;
              default:
                break;
            }
            break;
          case 'number':
            conf.type = ComponentTypes.number;
            break;
          default:
            conf.type = ComponentTypes.text;
            break;
        }

        if (!conf.type) {
          return null;
        }
        return conf;
      }),
      // schema源码插件
      SchemaViewerPluginRegister(),
      // 页面返回按钮注册插件
      (function pageReturnPluginRegistry({ skeleton }) {
        return {
          init: async () => {
            skeleton.add({
              title: 'page-editor-info',
              area: SkeletonAreaEnum.topLeftArea,
              content: (
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={goBack} size='small'>返回</Button>
              )
            });
          },
          destroy: async () => {
            skeleton.remove('page-editor-info');
          }
        };
      }),
      // 设计器保存按钮区域注册插件
      (function pageOperationPluginRegistry({ skeleton, project }) {
        return {
          init: async () => {
            skeleton.add({
              title: 'page-operation',
              area: SkeletonAreaEnum.topRightArea,
              content: <PageEditorOperation project={project} />
            });
          },
          destroy: async () => {
            skeleton.remove('page-operation');
          }
        };
      }),
    ];
  }, []);

  return (
    <div className={styles['page-editor']}>
      <Editor packages={packages} plugins={plugins} />
    </div>
  );
});

PageEditor.displayName = 'PageEditor';

export default PageEditor;
