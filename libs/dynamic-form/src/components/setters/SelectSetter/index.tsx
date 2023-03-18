import { memo } from 'react';
import { Form, Input, Select } from 'antd';
import { ISelectSetter, IStringSetter } from '../../../models';
import { useSetterName } from '../../../hooks';

const Setter: React.FC<ISelectSetter> = memo(props => {

  const { label, required, help, multiple, data } = props;
  const name = useSetterName();

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required, message: help }]}
    >
      <Select
        mode={multiple ? 'multiple' : null}
        options={data}
      />
    </Form.Item>
  );
});

Setter.displayName = 'SelectSetter';

export default Setter;

