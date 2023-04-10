import React, { memo, useCallback, useContext, useMemo } from 'react';
import styles from './index.module.less';
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { Editor, IPluginRegister, SkeletonAreaEnum } from '@lowcode-engine/editor';
import { ComponentGalleryPluginRegister, ComponentToolBarRegister, HierarchyIndicatorRegister, IBusinessModel, ModelGalleryPluginRegister, SchemaViewerPluginRegister } from '@lowcode-engine/primary-plugin';
import PageEditorOperation from '../../components/PageEditorOperation';
import { ComponentPackageContext } from '../../contexts';
import { ButtonUIType, ComponentTypes, IButtonComponentConfiguration, ITableComponentConfiguration, TableSelectionMode, RegisterSetter as RegisterPrimarySetter, GridSystemSection, ITabsComponentConfiguration, ITabComponentConfiguration } from '@lowcode-engine/primary-component-package';
import { RegisterSetter as RegisterSharedSetter } from '@lowcode-engine/component-configuration-shared';
import { Button } from 'antd';
import * as _ from 'lodash';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { EventCenterEngineContext, GenerateComponentId, GenerateNestedComponentId, GenerateShortId, IComponentConfiguration, IEventCenterEngineContext } from '@lowcode-engine/core';
import { ModelRepository } from '../../models';
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

const PageEditor: React.FC = memo(() => {

  const packages = useContext(ComponentPackageContext);
  const { businessModel } = useParams();
  const { schema } = useLoaderData() as { model: IBusinessModel, schema: IComponentConfiguration };
  const navigate = useNavigate();
  const goBack = useCallback(() => {
    navigate(`/app/business-detail/${businessModel}`);
  }, []);

  const eventCenterEngineContext = useMemo<IEventCenterEngineContext>(() => {

    return {
      dispatch: async (event, data?) => {

      },
      registerAction: (component, action, executor) => {

      },
      deRegisterAction: (component) => {

      },
    };
  }, []);

  const plugins = useMemo<Array<IPluginRegister>>(() => {
    return [
      // 组件插槽相关注册插件
      function pageOperationPluginRegistry({ slot }) {
        return {
          init: async () => {
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
      function configAddingHandlerPluginRegistry({ configurationAddingHandler, configurationDeleteHandler, configuration }) {
        return {
          init: async () => {

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

            configurationAddingHandler.registerHandler({ typeSelector: ComponentTypes.table }, async (conf: ITableComponentConfiguration) => {
              conf.selectionColumn = {
                id: GenerateNestedComponentId(conf.id, ComponentTypes.tableSelectionColumn),
                type: ComponentTypes.tableSelectionColumn,
                selectionMode: TableSelectionMode.multiple,
                title: '选择列',
              };
              return conf;
            });

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
              // eslint-disable-next-line no-param-reassign
              conf.code = GenerateShortId();
              return conf;
            });

            // configurationDeleteHandler.registerHandler(
            //   { typeSelector: ComponentTypes.table },
            //   async (current: ITabComponentConfiguration, parent: ITabsComponentConfiguration) => {
            //     console.log(`current:`, current);
            //     console.log(`parent:`, parent);
            //   });

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
      // function configSelectorPluginRegistry({ configuration }) {
      //   return {
      //     init: async () => {
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
      function pageProjectPluginRegistry({ project }) {
        return {
          init: async () => {
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
      function pageReturnPluginRegistry({ skeleton }) {
        const skeletonKey = 'EDITOR_RETURN_ST';
        return {
          init: async () => {
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
      function pageOperationPluginRegistry({ skeleton, project }) {
        const skeletonKey = 'PAGE_OPERATION_ST';
        return {
          init: async () => {
            skeleton.add({
              key: skeletonKey,
              area: SkeletonAreaEnum.topRightArea,
              content: <PageEditorOperation project={project} />
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
      <EventCenterEngineContext.Provider value={eventCenterEngineContext}>
        <Editor packages={packages} plugins={plugins} />
      </EventCenterEngineContext.Provider>
    </div>
  );
});

PageEditor.displayName = 'PageEditor';

export default PageEditor;
