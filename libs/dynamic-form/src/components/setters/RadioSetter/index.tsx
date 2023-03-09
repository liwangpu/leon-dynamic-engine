import { memo } from 'react';
import { Form, Radio } from 'antd';
import { IRadioSetter } from '../../../models';
import { useSetterName } from '../../../hooks';

const Setter: React.FC<IRadioSetter> = memo(props => {

  const { label, required, help, data } = props;
  const name = useSetterName();

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required, message: help }]}
    >
      <Radio.Group options={data} />
    </Form.Item>
  );
});

Setter.displayName = 'RadioSetter';

export default Setter;


