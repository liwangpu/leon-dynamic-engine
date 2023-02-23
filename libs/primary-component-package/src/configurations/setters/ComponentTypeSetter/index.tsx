import { memo } from 'react';
import { Checkbox, Form } from 'antd';
import { IBooleanSetter, SetterRegedit, SetterType } from '../../configureRegedit';

const Setter: React.FC<IBooleanSetter> = memo(props => {

  const { label, name, required, help } = props;



  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required, message: help }]}
    >
      {/* <Input /> */}
    </Form.Item>
  );
});

Setter.displayName = 'ComponentTypeSetter';

SetterRegedit.register(SetterType.componentTypeSetter, Setter);
