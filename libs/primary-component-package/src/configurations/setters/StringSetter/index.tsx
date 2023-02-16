import { memo } from 'react';
import { Form, Input } from 'antd';
import { IStringSetter, SetterRegedit, SetterType } from '../../configureRegedit';

const Setter: React.FC<IStringSetter> = memo(props => {

  const { label, name, required, help } = props;
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required: required, message: help }]}
    >
      <Input />
    </Form.Item>
  );
});

Setter.displayName = 'StringSetter';

SetterRegedit.register(SetterType.stringSetter, Setter);
