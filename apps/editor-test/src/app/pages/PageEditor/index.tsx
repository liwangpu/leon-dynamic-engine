import React, { memo, useCallback, useContext, useMemo, useRef } from 'react';
import styles from './index.module.less';
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { Editor, IEditorRef, IPluginRegister, SkeletonAreaEnum } from '@lowcode-engine/editor';
import { ComponentGalleryPluginRegister, ComponentToolBarRegister, HierarchyIndicatorRegister, IBusinessModel, ModelGalleryPluginRegister, SchemaViewerPluginRegister } from '@lowcode-engine/primary-plugin';
import { ComponentPackageContext } from '../../contexts';
import { ComponentTypes, RegisterSetter as RegisterPrimarySetter, GridSystemSection, ITabsComponentConfiguration, ITabComponentConfiguration, ITableComponentConfiguration, TableFeature, TableSelectionMode } from '@lowcode-engine/primary-component-package';
import { RegisterSetter as RegisterSharedSetter } from '@lowcode-engine/component-configuration-shared';
import { Button, Modal, notification } from 'antd';
import * as _ from 'lodash';
import { ArrowLeftOutlined, ClearOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons';
import { GenerateComponentCode, GenerateComponentId, GenerateNestedComponentId, GenerateShortId, IComponentConfiguration, IProjectSchema } from '@lowcode-engine/core';
import { ModelRepository, PageRepository } from '../../models';
import { ComponentTypes as VideoPlayerComponentTypes } from '../../video-player';
import { IVideoPlayerComponentConfiguration } from '../../video-player';
import { buttonGroupTypes, ComponentIndexTitleIncludeGroupTypes, FormInputGroupTypes, selfSlotGroupTypes } from '../../consts';

const { confirm } = Modal;

RegisterPrimarySetter();
RegisterSharedSetter();

const PageEditor: React.FC = memo(() => {

  const packages = useContext(ComponentPackageContext);
  const { pageId, businessModel } = useParams();
  const { schema } = useLoaderData() as { model: IBusinessModel, schema: IProjectSchema };
  const schemaRef = useRef<IProjectSchema>(schema);
  const editorRef = useRef<IEditorRef>();
  const navigate = useNavigate();

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
      ({ slot }) => {
        return {
          init() {
            slot.registerMap({
              [ComponentTypes.detailPage]: {
                children: {
                  rejects: [...buttonGroupTypes, ...FormInputGroupTypes, ...selfSlotGroupTypes]
                },
                operators: {
                  accepts: [...buttonGroupTypes]
                }
              },
              [ComponentTypes.listPage]: {
                children: {
                  rejects: [...buttonGroupTypes, ...FormInputGroupTypes, ...selfSlotGroupTypes]
                },
                operators: {
                  accepts: [...buttonGroupTypes]
                }
              },
              [ComponentTypes.block]: {
                children: {
                  rejects: [...buttonGroupTypes, ...selfSlotGroupTypes]
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
                  rejects: [...buttonGroupTypes, ...selfSlotGroupTypes]
                }
              },
              [ComponentTypes.table]: {
                operators: {
                  accepts: [...buttonGroupTypes]
                },
                columns: {
                  accepts: [...FormInputGroupTypes],
                  rejects: [...buttonGroupTypes]
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
      // 组件配置副作用注册插件
      ({ configurationAddingEffect, configurationDeleteEffect, configurationTypeTransferEffect, configuration }) => {
        return {
          init() {
            /********************************组件添加副作用********************************/

            configurationAddingEffect.registerHandler({ parentType: ComponentTypes.block, type: FormInputGroupTypes }, ({ current }) => {
              // eslint-disable-next-line no-param-reassign
              current.gridColumnSpan = GridSystemSection['1/2'];
              return current;
            });

            configurationAddingEffect.registerHandler({ parentType: ComponentTypes.block, type: ComponentTypes.textarea }, ({ current }) => {
              // eslint-disable-next-line no-param-reassign
              current.gridRowSpan = 3;
              return current;
            });

            configurationAddingEffect.registerHandler({ type: ComponentTypes.table, }, ({ current }: { current: ITableComponentConfiguration }) => {
              // 添加表格默认支持操作列和分页
              current.features = [
                TableFeature.selectionColumn,
                TableFeature.operationColumn,
                TableFeature.pagination,
              ];
              current.pagination = { id: GenerateNestedComponentId(current.id, ComponentTypes.pagination), type: ComponentTypes.pagination, title: '分页器', pageSize: 20 };
              current.selectionColumn = { id: GenerateNestedComponentId(current.id, ComponentTypes.tableSelectionColumn), type: ComponentTypes.tableSelectionColumn, selectionMode: TableSelectionMode.multiple };
              current.operatorColumn = { id: GenerateNestedComponentId(current.id, ComponentTypes.tableOperatorColumn), type: ComponentTypes.tableOperatorColumn, title: '操作列', visible: true, tileButtonCount: 3 };

              return current;
            }
            );

            configurationAddingEffect.registerHandler({ type: ComponentTypes.tabs }, ({ current }: { current: ITabsComponentConfiguration }) => {
              current.children = [
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

              current.defaultActiveTab = current.children[0].id;
              current.direction = 'horizontal';
              current.fullHeight = true;
              return current;
            });

            configurationAddingEffect.registerHandler({ type: VideoPlayerComponentTypes.videoPlayer }, ({ current }: { current: IVideoPlayerComponentConfiguration }) => {
              current.vedioUrl = 'https://www.runoob.com/try/demo_source/movie.ogg';
              return current;
            });

            configurationAddingEffect.registerHandler({}, ({ current }) => {
              const typeCount = configuration.getComponentTypeCount(current.type);
              // eslint-disable-next-line no-param-reassign
              if (!current.code) {
                current.code = GenerateComponentCode(current.type);
              }
              if (ComponentIndexTitleIncludeGroupTypes.has(current.type)) {
                if (current.title) {
                  // 取出组件标题,如果后面一位不是数字,加上数字标识
                  const lastChar = current.title[current.title.length - 1];
                  const isIndex = !isNaN(parseInt(lastChar));
                  if (!isIndex) {
                    current.title = `${current.title} ${typeCount + 1}`;
                  }
                }
              }
              return current;
            });

            configurationAddingEffect.registerHandler({ type: ComponentTypes.block }, ({ current, path }: { current: IVideoPlayerComponentConfiguration, path: Array<IComponentConfiguration> }) => {
              // current.vedioUrl = 'https://www.runoob.com/try/demo_source/movie.ogg';
              // return current;
              console.log(`add block path:`, path);
              return current;
            });

            /********************************组件删除副作用********************************/
            configurationDeleteEffect.registerHandler({ type: ComponentTypes.tab }, ({ parent }: { current: ITabComponentConfiguration, parent: ITabsComponentConfiguration }) => {
              // 如果当前的页签已经已经是最后一个,那么不允许删除
              if (parent.children.length === 1) {
                return {
                  canDelete: false,
                  message: '已经是最后一个页签了,不能执行删除',
                };
              }
            },
              ({ current, parent }: { current: ITabComponentConfiguration, parent: ITabsComponentConfiguration }) => {
                // 如果当前的页签是默认页签,那么需要把多页签组件默认页签信息更新
                if (current.isDefault) {
                  const firstTab = parent.children[0];

                  configuration.updateComponents([
                    ({ id: parent.id, type: parent.type, defaultActiveTab: firstTab.id } as Partial<ITabsComponentConfiguration>),
                    ({ id: firstTab.id, type: firstTab.type, isDefault: true } as Partial<ITabComponentConfiguration>),
                  ]);
                }
              });

            // configurationDeleteEffect.registerHandler({
            //   type: ComponentTypes.block,
            //   parentType: ComponentTypes.block,
            // }, ({ current, parent }) => {

            //   return {
            //     canDelete: false,
            //     message: '不想给你删除',
            //   };
            // });

            /********************************组件转化类型副作用********************************/
            configurationTypeTransferEffect.registerHandler({ destType: VideoPlayerComponentTypes.videoPlayer }, ({ current }: { current: IVideoPlayerComponentConfiguration }) => {
              current.vedioUrl = 'https://www.runoob.com/try/demo_source/movie.ogg';
              return current;
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
      <Editor packages={packages} plugins={plugins} ref={editorRef} />
    </div>
  );
});

PageEditor.displayName = 'PageEditor';

export default PageEditor;
