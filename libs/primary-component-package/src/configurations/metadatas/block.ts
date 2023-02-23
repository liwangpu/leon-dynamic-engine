import { ISetterPanelContext } from '@lowcode-engine/editor';
import { ComponentTypes } from '../../enums';
import { ISetterMetadataGenerator, MetadataRegedit, SetterType } from '../configureRegedit';

const metadataGenerator: ISetterMetadataGenerator = async () => {
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
                setter: SetterType.stringSetter,
                name: 'title',
                label: '标题',
                required: true
              },
              {
                setter: SetterType.stringSetter,
                name: 'code',
                label: '编码',
              }
            ]
          },
        ]
      },
    ]
  }
};

const context: ISetterPanelContext = {
  type: ComponentTypes.block
};

MetadataRegedit.register(context, metadataGenerator);