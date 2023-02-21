import { memo } from 'react';
import { Form, Radio } from 'antd';
import { IRadioSetter, SetterRegedit, SetterType } from '../../configureRegedit';

const Setter: React.FC<IRadioSetter> = memo(props => {

  const { label, name, required, help, data } = props;

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

SetterRegedit.register(SetterType.radioSetter, Setter);
