
import { IStringSetter } from '@lowcode-engine/dynamic-form';
import { Form, Input } from 'antd';
import { memo } from 'react';

const CustomSetter1: React.FC<IStringSetter> = memo(props => {

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