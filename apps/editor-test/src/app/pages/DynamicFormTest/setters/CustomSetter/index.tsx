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

export default CustomSetter1;