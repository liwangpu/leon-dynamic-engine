import { DynamicForm, IBaseSetter, IStringSetter, SetterType, SettterRendererContext } from '@lowcode-engine/component-configuration-shared';
import { Form, Input } from 'antd';
import { memo, useContext } from 'react';

const CustomSetter1: React.FC<IBaseSetter> = memo(props => {

  const { label, name, required, help } = props;
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required, message: help }]}
    >
      <Input />
    </Form.Item>
  );
});

CustomSetter1.displayName = 'CustomSetter1';

const CustomListItem: React.FC = memo(props => {

  const setterRendererCtx = useContext(SettterRendererContext);
  const SetterRenderer = setterRendererCtx.getFactory();

  const nameFieldConf: IStringSetter = {
    setter: SetterType.stringSetter,
    label: '姓名',
    name: 'name'
  };
  return (
    <div>
      <SetterRenderer config={nameFieldConf}/>
    </div>
  );
});

CustomListItem.displayName = 'CustomListItem';

export default function registerSetter() {
  DynamicForm.instance.registerSetter('custom-1', CustomSetter1);
  DynamicForm.instance.registerSetter('custom-list-item', CustomListItem);
}