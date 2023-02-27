import { ISetterMetadataGenerator, SetterType, DynamicForm } from '@lowcode-engine/component-configuration-shared';
import { ISetterPanelContext } from '@lowcode-engine/editor';
import { ComponentTypes, PrimarySetterType } from '../../enums';

export default function registerMetdata(): void {

  const metadataGenerator: ISetterMetadataGenerator = async (ctx) => {
    return {
      tabs: [
        {
          title: '属性',
          children: [
            {
              setter: SetterType.primaryHeadingSetter,
              title: '基本信息',
              children: [
                {
                  setter: PrimarySetterType.componentTypeSetter,
                  name: 'type',
                  label: '组件类型',
                  disabled: true,
                },
                {
                  setter: SetterType.stringSetter,
                  name: 'title',
                  label: '标题',
                  required: true,
                  help: '请输入xxxx'
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
      ],
    };
  }

  const context: ISetterPanelContext = {
    type: ComponentTypes.listPage
  };

  DynamicForm.instance.registerMetadata(context, metadataGenerator);

}