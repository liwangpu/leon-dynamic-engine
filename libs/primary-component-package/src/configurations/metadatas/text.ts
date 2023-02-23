import { ComponentTypes } from '../../enums';
import { MetadataRegedit, SetterType } from '../configureRegedit';

// 默认配置
MetadataRegedit.register({
  type: ComponentTypes.text
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
              setter: SetterType.stringSetter,
              name: 'code',
              label: '编码',
              required: true,
            }
          ]
        },
      ]
    }
  ]
}));

// 区块里面的配置
MetadataRegedit.register({
  type: ComponentTypes.text,
  parentType: ComponentTypes.block
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
              setter: SetterType.stringSetter,
              name: 'code',
              label: '编码',
              required: true,
            },
            {
              setter: SetterType.gridColumnSpanSetter,
              name: 'gridColumnSpan',
              label: '大小'
            }
          ]
        },
      ]
    }
  ]
}));

// 表格里面的配置
MetadataRegedit.register({
  type: ComponentTypes.text,
  parentType: ComponentTypes.table,
  slot: 'columns'
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
              setter: SetterType.stringSetter,
              name: 'code',
              label: '编码',
              required: true,
            }
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
    }
  ]
}));