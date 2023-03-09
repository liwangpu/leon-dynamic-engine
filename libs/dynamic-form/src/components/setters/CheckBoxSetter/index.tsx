import { memo } from 'react';
import { Checkbox, Form } from 'antd';
import { ICheckBoxSetter } from '../../../models';
import { useSetterName } from '../../../hooks';

const Setter: React.FC<ICheckBoxSetter> = memo(props => {

  const { label, required, help, data } = props;
  const name = useSetterName();

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

export default Setter;
