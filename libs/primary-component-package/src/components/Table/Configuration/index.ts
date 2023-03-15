import { IMetadataRegister } from '@lowcode-engine/component-configuration-shared';
import { SetterType } from '@lowcode-engine/dynamic-form';
import { IPaginationComponentConfiguration, ISerialNumberColumnComponentConfiguration, ITableComponentConfiguration, ITableOperatorColumnComponentConfiguration } from '../../../models';
import { ComponentTypes, PrimarySetterType, TableFeature, TableSlot } from '../../../enums';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { GenerateNestedComponentId } from '@lowcode-engine/core';
import { SubSink } from 'subsink';

const registerMetadata: IMetadataRegister = add => {

  add({
    type: ComponentTypes.table
  }, async editor => {
    const subs = new SubSink();
    return {
      children: [
        {
          key: 'tabs',
          setter: SetterType.tabs,
          children: [
            {
              key: 'basic-info',
              setter: SetterType.tabPane,
              label: '属性',
              children: [
                {
                  key: 'basic-info',
                  setter: SetterType.primaryHeading,
                  label: '基础信息',
                  children: [
                    {
                      key: 'type',
                      setter: PrimarySetterType.componentType,
                      name: 'type',
                      label: '组件类型',
                      disabled: true,
                    },
                    {
                      key: 'title',
                      setter: SetterType.string,
                      name: 'title',
                      label: '标题',
                    },
                    {
                      key: 'code',
                      setter: SetterType.string,
                      name: 'code',
                      label: '编码',
                    },
                    {
                      key: 'features',
                      setter: SetterType.checkBox,
                      name: 'features',
                      label: '表格功能',
                      data: [
                        { value: TableFeature.serialNumberColumn, label: '序号' },
                        { value: TableFeature.operationColumn, label: '操作列' },
                        { value: TableFeature.pagination, label: '分页' },
                      ]
                    }
                  ],
                },
              ]
            },
          ]
        }
      ],
      onLoad: async (config: ITableComponentConfiguration, obs: Observable<ITableComponentConfiguration>) => {
        const paginationId = GenerateNestedComponentId(config.id, ComponentTypes.pagination);
        const serialNumberColumnId = GenerateNestedComponentId(config.id, ComponentTypes.tableSerialNumberColumn);
        const operatorColumnId = GenerateNestedComponentId(config.id, ComponentTypes.tableOperatorColumn);
        // 分页功能配置切换
        subs.sink = obs
          .pipe(map(c => c.features), map(arr => arr.includes(TableFeature.pagination)))
          .pipe(distinctUntilChanged())
          .subscribe((enable: boolean) => {
            if (enable) {
              const conf: IPaginationComponentConfiguration = { id: paginationId, type: ComponentTypes.pagination, title: '分页器', pageSize: 10 };
              editor.project.addComponent(conf, config.id, 0, TableSlot.pagination);
            } else {
              editor.project.deleteComponent(paginationId);
            }
          });
        // 序号列功能配置切换
        subs.sink = obs
          .pipe(map(c => c.features), map(arr => arr.includes(TableFeature.serialNumberColumn)))
          .pipe(distinctUntilChanged())
          .subscribe((enable: boolean) => {
            if (enable) {
              const conf: ISerialNumberColumnComponentConfiguration = { id: serialNumberColumnId, type: ComponentTypes.tableSerialNumberColumn, title: '序号列', visible: true };
              editor.project.addComponent(conf, config.id, 0, TableSlot.serialNumberColumn);
            } else {
              editor.project.deleteComponent(serialNumberColumnId);
            }
          });
        // 表格操作列功能配置切换
        subs.sink = obs
          .pipe(map(c => c.features), map(arr => arr.includes(TableFeature.operationColumn)))
          .pipe(distinctUntilChanged())
          .subscribe((enable: boolean) => {
            if (enable) {
              const conf: ITableOperatorColumnComponentConfiguration = { id: operatorColumnId, type: ComponentTypes.tableOperatorColumn, title: '操作列', visible: true };
              editor.project.addComponent(conf, config.id, 0, TableSlot.operatorColumn);
            } else {
              editor.project.deleteComponent(operatorColumnId);
            }
          });
      },
      onDestroy: async () => {
        subs.unsubscribe();
      }
    };
  });
};

export default registerMetadata;