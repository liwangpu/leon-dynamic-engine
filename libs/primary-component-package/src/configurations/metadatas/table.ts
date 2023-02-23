import { GenerateNestedComponentId } from '@lowcode-engine/core';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { SubSink } from 'subsink';
import { ComponentTypes, TableFeature, TableSelectionMode, TableSlot } from '../../enums';
import { IPaginationComponentConfiguration, ISerialNumberColumnComponentConfiguration, ITableComponentConfiguration, ITableOperatorColumnComponentConfiguration } from '../../models';
import { MetadataRegedit, SetterType } from '../configureRegedit';

// 表格
MetadataRegedit.register({
  type: ComponentTypes.table
}, async (editor) => {
  const subs = new SubSink();
  return {
    tabs: [
      {
        title: '属性',
        children: [
          {
            setter: SetterType.setterGroup,
            title: '基本信息',
            children: [
              {
                setter: SetterType.componentTypeSetter,
                name: 'type',
                label: '组件类型',
                disabled: true,
              },
              {
                setter: SetterType.stringSetter,
                name: 'title',
                label: '标题',
                required: true
              },
              {
                setter: SetterType.stringSetter,
                name: 'code',
                label: '编码',
              },
              {
                setter: SetterType.checkBoxSetter,
                name: 'features',
                label: '表格功能',
                data: [
                  { value: TableFeature.serialNumberColumn, label: '序号' },
                  { value: TableFeature.operationColumn, label: '操作列' },
                  { value: TableFeature.pagination, label: '分页' },
                ]
              }
            ]
          },
        ]
      },
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
            editor.store.addComponent(conf, config.id, 0, TableSlot.pagination);
          } else {
            editor.store.deleteComponent(paginationId);
          }
        });
      // 序号列功能配置切换
      subs.sink = obs
        .pipe(map(c => c.features), map(arr => arr.includes(TableFeature.serialNumberColumn)))
        .pipe(distinctUntilChanged())
        .subscribe((enable: boolean) => {
          if (enable) {
            const conf: ISerialNumberColumnComponentConfiguration = { id: serialNumberColumnId, type: ComponentTypes.tableSerialNumberColumn, title: '序号列', visible: true };
            editor.store.addComponent(conf, config.id, 0, TableSlot.serialNumberColumn);
          } else {
            editor.store.deleteComponent(serialNumberColumnId);
          }
        });
      // 表格操作列功能配置切换
      subs.sink = obs
        .pipe(map(c => c.features), map(arr => arr.includes(TableFeature.operationColumn)))
        .pipe(distinctUntilChanged())
        .subscribe((enable: boolean) => {
          if (enable) {
            const conf: ITableOperatorColumnComponentConfiguration = { id: operatorColumnId, type: ComponentTypes.tableOperatorColumn, title: '操作列', visible: true };
            editor.store.addComponent(conf, config.id, 0, TableSlot.operatorColumn);
          } else {
            editor.store.deleteComponent(operatorColumnId);
          }
        });
    },
    onDestroy: async () => {
      subs.unsubscribe();
    }
  };
});

// 表格分页器
MetadataRegedit.register({
  type: ComponentTypes.pagination
}, async () => ({
  tabs: [
    {
      title: '属性',
      children: [
        {
          setter: SetterType.setterGroup,
          title: '基本信息',
          children: [
            {
              setter: SetterType.componentTypeSetter,
              name: 'type',
              label: '组件类型',
              disabled: true,
            },
            {
              setter: SetterType.stringSetter,
              name: 'title',
              label: '标题',
              required: true
            },
            {
              setter: SetterType.numberSetter,
              name: 'pageSize',
              label: '每页条数',
              required: true,
              min: 0,
              step: 1
            }
          ]
        },
      ]
    },
  ]
}));

// 表格序号列
MetadataRegedit.register({
  type: ComponentTypes.tableSerialNumberColumn
}, async () => ({
  tabs: [
    {
      title: '属性',
      children: [
        {
          setter: SetterType.setterGroup,
          title: '基本信息',
          children: [
            {
              setter: SetterType.componentTypeSetter,
              name: 'type',
              label: '组件类型',
              disabled: true,
            },
            {
              setter: SetterType.stringSetter,
              name: 'title',
              label: '标题',
              required: true
            },

          ]
        },
        {
          setter: SetterType.setterGroup,
          title: '通用设置',
          children: [
            {
              setter: SetterType.booleanSetter,
              name: 'visible',
              label: '显示列',
            },
            {
              setter: SetterType.booleanSetter,
              name: 'freeze',
              label: '冻结列',
            },
            {
              setter: SetterType.booleanSetter,
              name: 'export',
              label: '导出列',
            },
          ]
        },
      ]
    },
  ]
}));

// 表格操作列
MetadataRegedit.register({
  type: ComponentTypes.tableOperatorColumn
}, async () => ({
  tabs: [
    {
      title: '属性',
      children: [
        {
          setter: SetterType.setterGroup,
          title: '基本信息',
          children: [
            {
              setter: SetterType.componentTypeSetter,
              name: 'type',
              label: '组件类型',
              disabled: true,
            },
            {
              setter: SetterType.stringSetter,
              name: 'title',
              label: '标题',
              required: true
            },

          ]
        }
      ]
    },
  ]
}));

// 表格选择列
MetadataRegedit.register({
  type: ComponentTypes.tableSelectionColumn
}, async () => ({
  tabs: [
    {
      title: '属性',
      children: [
        {
          setter: SetterType.setterGroup,
          title: '基本信息',
          children: [
            {
              setter: SetterType.componentTypeSetter,
              name: 'type',
              label: '组件类型',
              disabled: true,
            },
            {
              setter: SetterType.stringSetter,
              name: 'title',
              label: '标题',
            },
            {
              setter: SetterType.radioSetter,
              name: 'selectionMode',
              label: '选择方式',
              data: [
                { value: TableSelectionMode.single, label: '单选' },
                { value: TableSelectionMode.multiple, label: '多选' }
              ]
            },
          ]
        }
      ]
    },
  ]
}));