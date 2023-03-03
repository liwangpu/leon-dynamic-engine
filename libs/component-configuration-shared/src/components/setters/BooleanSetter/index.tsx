import { memo } from 'react';
import { Checkbox, Form } from 'antd';
import { IBooleanSetter } from '../../../models';
import { useSetterName } from '../../../hooks';

const Setter: React.FC<IBooleanSetter> = memo(props => {

  const { label, required, help } = props;
  const name = useSetterName();

  return (
    <Form.Item
      valuePropName="checked"
      name={name}
      rules={[{ required, message: help }]}
    >
      <Checkbox>{label}</Checkbox>
    </Form.Item>
  );
});

Setter.displayName = 'BooleanSetter';

export default Setter;