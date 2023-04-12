import React, { memo, useCallback, useContext, useMemo, useRef } from 'react';
import styles from './index.module.less';
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { Editor, IEditorRef, IPluginRegister, SkeletonAreaEnum } from '@lowcode-engine/editor';
import { ComponentGalleryPluginRegister, ComponentToolBarRegister, HierarchyIndicatorRegister, IBusinessModel, ModelGalleryPluginRegister, SchemaViewerPluginRegister } from '@lowcode-engine/primary-plugin';
import { ComponentPackageContext } from '../../contexts';
import { ButtonUIType, ComponentTypes, IButtonComponentConfiguration, RegisterSetter as RegisterPrimarySetter, GridSystemSection, ITabsComponentConfiguration, ITabComponentConfiguration } from '@lowcode-engine/primary-component-package';
import { RegisterSetter as RegisterSharedSetter } from '@lowcode-engine/component-configuration-shared';
import { Button, notification } from 'antd';
import * as _ from 'lodash';
import { ArrowLeftOutlined, ClearOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons';
import { GenerateComponentId, GenerateShortId, IComponentConfiguration, IProjectSchema } from '@lowcode-engine/core';
import { ModelRepository, PageRepository } from '../../models';
import { ComponentTypes as VideoPlayerComponentTypes } from '../../video-player';
import { IVideoPlayerComponentConfiguration } from '../../video-player';

RegisterPrimarySetter();
RegisterSharedSetter();

const buttonTypes: Array<ComponentTypes> = [
  ComponentTypes.button,
  ComponentTypes.buttonGroup
];

const selfSlotTypes: Array<ComponentTypes> = [
  ComponentTypes.tab
];

const formInputTypes: Array<ComponentTypes> = [
  ComponentTypes.text,
  ComponentTypes.textarea,
  ComponentTypes.number
];

const ComponentIndexTitleIncludeTypes = new Set<string>([
  ComponentTypes.block,
  ComponentTypes.table,
  ComponentTypes.button,
  ComponentTypes.buttonGroup,
]);

const GenerateComponentCode = (type: string) => {
  return GenerateShortId(type, 8).toLocaleLowerCase().replace('-', '_');
}

const PageEditor: React.FC = memo(() => {

  const packages = useContext(ComponentPackageContext);
  const { pageId, businessModel } = useParams();
  const { schema } = useLoaderData() as { model: IBusinessModel, schema: IComponentConfiguration };
  const editorRef = useRef<IEditorRef>();
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    if (window.opener != null && !window.opener.closed) {
      window.close();
    } else {
      window.name = null;
      navigate(`/app/business-detail/${businessModel}`);
    }
  }, []);

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
    const ctx = editorRef.current.getContext();
    const s = ctx.project.export();
    console.log(`schema save:`, s);
    await PageRepository.getInstance().update(s.id, s);
    showMessage();
  };

  const clearSchema = async () => {
    const ctx = editorRef.current.getContext();
    const schema = ctx.project.export();
    const newSchema: IProjectSchema = {
      ...schema,
      children: [],
      operators: []
    };
    await PageRepository.getInstance().update(newSchema.id, newSchema);
    ctx.project.import(newSchema);
    showMessage('清空成功');
  };

  const previewPage = useCallback(() => {
    window.open(`/app/page-preview/${businessModel}/${pageId}?showNav=true`, `preview-page@${businessModel}#${pageId}`);
  }, []);

  const plugins = useMemo<Array<IPluginRegister>>(() => {
    return [
      // 组件插槽相关注册插件
      ({ slot }) => {
        return {
          init() {
            slot.registerMap({
              [ComponentTypes.detailPage]: {
                children: {
                  rejects: [...buttonTypes, ...formInputTypes, ...selfSlotTypes]
                },
                operators: {
                  accepts: [...buttonTypes]
                }
              },
              [ComponentTypes.listPage]: {
                children: {
                  rejects: [...buttonTypes, ...formInputTypes, ...selfSlotTypes]
                },
                operators: {
                  accepts: [...buttonTypes]
                }
              },
              [ComponentTypes.block]: {
                children: {
                  rejects: [...buttonTypes, ...selfSlotTypes]
                }
              },
              [ComponentTypes.buttonGroup]: {
                children: {
                  accepts: [ComponentTypes.button]
                }
              },
              [ComponentTypes.tabs]: {
                children: {
                  accepts: [ComponentTypes.tab]
                }
              },
              [ComponentTypes.tab]: {
                children: {
                  rejects: [...buttonTypes, ...selfSlotTypes]
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
                  singleton: true
                },
                pagination: {
                  singleton: true
                },
                serialNumberColumn: {
                  singleton: true
                },
                selectionColumn: {
                  singleton: true
                }
              },
              [ComponentTypes.tableOperatorColumn]: {
                children: {
                  accepts: [ComponentTypes.button]
                }
              }
            });
          }
        };
      },
      // 组件元数据处理管道注册插件
      ({ configurationAddingHandler, configurationDeleteHandler, configuration }) => {
        return {
          init() {
            // 组件添加元数据
            configurationAddingHandler.registerHandler({ parentTypeSelector: ComponentTypes.block, typeSelector: [ComponentTypes.text, ComponentTypes.number] }, async (conf) => {
              // eslint-disable-next-line no-param-reassign
              conf.gridColumnSpan = GridSystemSection['1/2'];
              return conf;
            });

            configurationAddingHandler.registerHandler({ parentTypeSelector: ComponentTypes.block, typeSelector: [ComponentTypes.textarea] }, async (conf) => {
              // eslint-disable-next-line no-param-reassign
              conf.gridColumnSpan = GridSystemSection['1/2'];
              conf.gridRowSpan = 3;
              return conf;
            });

            // configurationAddingHandler.registerHandler({ typeSelector: ComponentTypes.table }, async (conf: ITableComponentConfiguration) => {
            //   conf.selectionColumn = {
            //     id: GenerateNestedComponentId(conf.id, ComponentTypes.tableSelectionColumn),
            //     type: ComponentTypes.tableSelectionColumn,
            //     selectionMode: TableSelectionMode.multiple,
            //     title: '选择列',
            //   };
            //   return conf;
            // });

            configurationAddingHandler.registerHandler({ typeSelector: ComponentTypes.tabs }, async (conf: ITabsComponentConfiguration) => {
              conf.children = [
                {
                  id: GenerateComponentId(ComponentTypes.tab),
                  type: ComponentTypes.tab,
                  title: '页签 1',
                  isDefault: true
                },
                {
                  id: GenerateComponentId(ComponentTypes.tab),
                  type: ComponentTypes.tab,
                  title: '页签 2',
                },
                {
                  id: GenerateComponentId(ComponentTypes.tab),
                  type: ComponentTypes.tab,
                  title: '页签 3',
                },
              ];

              conf.defaultActiveTab = conf.children[0].id;
              conf.direction = 'horizontal';
              conf.fullHeight = true;
              return conf;
            });

            configurationAddingHandler.registerHandler({ typeSelector: ComponentTypes.button, parentTypeSelector: ComponentTypes.tableOperatorColumn }, async (conf: IButtonComponentConfiguration) => {
              conf.uiType = ButtonUIType.link;
              return conf;
            });

            configurationAddingHandler.registerHandler({ typeSelector: VideoPlayerComponentTypes.videoPlayer }, async (conf: IVideoPlayerComponentConfiguration) => {
              conf.vedioUrl = 'https://www.runoob.com/try/demo_source/movie.ogg';
              return conf;
            });

            configurationAddingHandler.registerHandler({ typeSelector: null }, async (conf) => {
              const typeCount = configuration.getComponentTypeCount(conf.type);
              // eslint-disable-next-line no-param-reassign
              if (!conf.code) {
                conf.code = GenerateComponentCode(conf.type);
              }
              if (ComponentIndexTitleIncludeTypes.has(conf.type)) {
                if (conf.title) {
                  // 取出组件标题,如果后面一位不是数字,加上数字标识
                  const lastChar = conf.title[conf.title.length - 1];
                  const isIndex = !isNaN(parseInt(lastChar));
                  if (!isIndex) {
                    conf.title = `${conf.title} ${typeCount + 1}`;
                  }
                }
              }
              return conf;
            });

            // configurationDeleteHandler.registerHandler(
            //   { typeSelector: ComponentTypes.table },
            //   async (current: ITabComponentConfiguration, parent: ITabsComponentConfiguration) => {
            //     console.log(`current:`, current);
            //     console.log(`parent:`, parent);
            //   });

            // 删除组件
            configurationDeleteHandler.registerHandler(
              { typeSelector: ComponentTypes.tab },
              async (current: ITabComponentConfiguration, parent: ITabsComponentConfiguration) => {
                // 如果当前的页签已经已经是最后一个,那么不允许删除
                if (parent.children.length === 1) {
                  return {
                    canDelete: false,
                    message: '已经是最后一个页签了,不能执行删除',
                  };
                }
              },
              async (current: ITabComponentConfiguration, parent: ITabsComponentConfiguration) => {
                // 如果当前的页签是默认页签,那么需要把多页签组件默认页签信息更新
                if (current.isDefault) {
                  const firstTab = parent.children[0];

                  configuration.updateComponents([
                    ({ id: parent.id, type: parent.type, defaultActiveTab: firstTab.id } as Partial<ITabsComponentConfiguration>),
                    ({ id: firstTab.id, type: firstTab.type, isDefault: true } as Partial<ITabComponentConfiguration>),
                  ]);
                }
              });
          },
        };
      },
      // // 组件面板配置数据选择器注册插件
      // ({ configuration }) => {
      //   return {
      //     init() {
      //       configuration.registerConfigurationSelector({
      //         type: ComponentTypes.listPage
      //       }, (editor, conf) => {
      //         const tree = editor.store.treeStore.trees.get(conf.id);
      //         const childrenIds = tree.slots.get('children');
      //         if (childrenIds?.length) {
      //           const children = [];
      //           childrenIds.forEach(id => {
      //             let sc = editor.store.configurationStore.configurations.get(id);
      //             // let c = sc.toData(true);
      //             children.push({ id: sc.id, type: sc.type, title: sc.title });
      //           });
      //           conf['children'] = children;
      //         }
      //         return conf;
      //       });
      //     },
      //   };
      // },
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
            // ComponentTypes.form
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
      // 模型库注册插件
      ModelGalleryPluginRegister(businessModel, async id => {
        return ModelRepository.getInstance().get(id);
      }, async data => {

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
                  <Button type="default" icon={<EyeOutlined />} onClick={previewPage} >预览</Button>
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
    <div className={styles['page-editor']}>
      <Editor packages={packages} plugins={plugins} ref={editorRef} />
    </div>
  );
});

PageEditor.displayName = 'PageEditor';

export default PageEditor;
