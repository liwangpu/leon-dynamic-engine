import { memo } from 'react';
import { Form, Input } from 'antd';
import { IStringSetter } from '../../../models';
import { useSetterName } from '../../../hooks';

const Setter: React.FC<IStringSetter> = memo(props => {

  const { label, required, help } = props;
  const name = useSetterName(props);

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

Setter.displayName = 'StringSetter';

export default Setter;

