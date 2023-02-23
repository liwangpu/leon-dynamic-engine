import React, { memo, useCallback, useContext, useMemo } from 'react';
import styles from './index.module.less';
import { useLoaderData, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Editor, IPluginRegister, SkeletonAreaEnum } from '@lowcode-engine/editor';
import { ComponentGalleryPluginRegister, ComponentToolBarRegister, IBusinessModel, ModelGalleryPluginRegister } from '@lowcode-engine/primary-plugin';
import PageEditorOperation from '../../components/PageEditorOperation';
import { ComponentPackageContext } from '../../contexts';
import { ButtonUIType, ComponentTypes, IButtonComponentConfiguration, ITableComponentConfiguration, TableSelectionMode, TableSlot } from '@lowcode-engine/primary-component-package';
import { Button } from 'antd';
import * as _ from 'lodash';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { GenerateComponentId, GenerateNestedComponentId, GenerateShortId, IComponentConfiguration } from '@lowcode-engine/core';
import { GridSystemSection } from '@lowcode-engine/component-configuration-shared';
import { ModelRepository } from '../../models';
import { ComponentTypes as VideoPlayerComponentTypes } from '../../video-player';
import { IVideoPlayerComponentConfiguration } from '../../video-player';

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
  const { model, schema } = useLoaderData() as { model: IBusinessModel, schema: IComponentConfiguration };
  const navigate = useNavigate();
  const goBack = useCallback(() => {
    navigate(`/app/business-detail/${businessModel}`);
  }, []);

  const plugins = useMemo<Array<IPluginRegister>>(() => {
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

            configurationAddingHandler.registerHandler({ typeSelector: ComponentTypes.table }, async (conf: ITableComponentConfiguration) => {
              conf.selectionColumn = {
                id: GenerateNestedComponentId(conf.id, ComponentTypes.tableSelectionColumn),
                type: ComponentTypes.tableSelectionColumn,
                selectionMode: TableSelectionMode.multiple,
                title: '选择列',
              };
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
            // ComponentTypes.buttonGroup
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
      ComponentToolBarRegister({
        [ComponentTypes.listPage]: [],
        [ComponentTypes.detailPage]: [],
        [ComponentTypes.tableSerialNumberColumn]: [],
        [ComponentTypes.tableSelectionColumn]: [],
        [ComponentTypes.tableOperatorColumn]: [],
        [ComponentTypes.pagination]: [],
      }),
      // schema源码插件
      // SchemaViewerPluginRegister(),
      // 页面返回按钮注册插件
      (function pageReturnPluginRegistry({ skeleton }) {
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
      }),
      // 设计器保存按钮区域注册插件
      (function pageOperationPluginRegistry({ skeleton, project }) {
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
