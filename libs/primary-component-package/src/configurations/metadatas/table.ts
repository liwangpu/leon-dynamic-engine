import { ISetterPanelContext } from '@lowcode-engine/editor';
import { ComponentTypes, TableFeature } from '../../enums';
import { ISetterMetadata, MetadataRegedit, SetterType } from '../configureRegedit';

const metadata: ISetterMetadata = {
  tabs: [
    {
      title: '属性',
      children: [
        {
          setter: SetterType.setterGroup,
          title: '基本信息',
          children: [
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
  ]
};

const context: ISetterPanelContext = {
  type: ComponentTypes.table
};

MetadataRegedit.register(context, metadata);