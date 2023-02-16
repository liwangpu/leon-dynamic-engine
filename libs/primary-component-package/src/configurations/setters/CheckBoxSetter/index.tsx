import { memo } from 'react';
import { Checkbox, Form } from 'antd';
import { ICheckBoxSetter, SetterRegedit, SetterType } from '../../configureRegedit';

const Setter: React.FC<ICheckBoxSetter> = memo(props => {

  const { label, name, required, help, data } = props;

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required, message: help }]}
    >
      <Checkbox.Group options={data} />
    </Form.Item>
  );
});

Setter.displayName = 'CheckBoxSetter';

SetterRegedit.register(SetterType.checkBoxSetter, Setter);
