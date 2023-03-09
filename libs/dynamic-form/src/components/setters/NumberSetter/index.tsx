import { memo } from 'react';
import { Form, InputNumber } from 'antd';
import { INumberSetter } from '../../../models';
import { useSetterName } from '../../../hooks';

const Setter: React.FC<INumberSetter> = memo(props => {

  const { label, required, help, min, max, step } = props;
  const name = useSetterName();

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

export default Setter;

