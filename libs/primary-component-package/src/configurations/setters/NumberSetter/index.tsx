import { memo } from 'react';
import { Form, InputNumber } from 'antd';
import { INumberSetter, SetterRegedit, SetterType } from '../../configureRegedit';

const Setter: React.FC<INumberSetter> = memo(props => {

  const { label, name, required, help, min, max, step } = props;
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required, message: help }]}
    >
      <InputNumber style={{ width: '100%' }} min={min} max={max} step={step} />
    </Form.Item>
  );
});

Setter.displayName = 'NumberSetter';

SetterRegedit.register(SetterType.numberSetter, Setter);
