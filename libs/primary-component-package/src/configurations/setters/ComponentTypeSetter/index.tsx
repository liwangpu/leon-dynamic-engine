import { memo, useMemo } from 'react';
import { Form, Select } from 'antd';
import { IBooleanSetter, SetterRegedit, SetterType } from '../../configureRegedit';
import { ComponentDescriptions } from '../../../componentPackage';

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

SetterRegedit.register(SetterType.componentTypeSetter, Setter);
