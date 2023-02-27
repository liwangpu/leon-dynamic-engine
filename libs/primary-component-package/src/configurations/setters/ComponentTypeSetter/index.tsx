import { memo, useMemo } from 'react';
import { Form, Select } from 'antd';
import { ComponentDescriptions } from '../../../componentPackage';
import { IBooleanSetter } from '@lowcode-engine/component-configuration-shared';

const Setter: React.FC<IBooleanSetter> = memo(props => {

  const { label, name, required, help, disabled } = props;

  const options = useMemo(() => {
    return ComponentDescriptions.map(d => ({ value: d.type, label: d.title }));
  }, []);

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required, message: help }]}
    >
      <Select disabled={disabled} options={options} />
    </Form.Item>
  );
});

Setter.displayName = 'ComponentTypeSetter';

export default Setter;
