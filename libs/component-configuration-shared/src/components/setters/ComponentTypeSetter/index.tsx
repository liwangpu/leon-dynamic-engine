import { memo, useContext, useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import { ISetterBase, useSetterName } from '@lowcode-engine/dynamic-form';
import { ComponentDiscoveryContext } from '@lowcode-engine/core';

const Setter: React.FC<ISetterBase> = memo(props => {

  const { label, required, help, disabled } = props;
  const componentDiscovery = useContext(ComponentDiscoveryContext);
  const [options, setOptions] = useState<Array<{ value: string, label: string }>>();
  const name = useSetterName();

  useEffect(() => {
    (async () => {
      const descriptions = await componentDiscovery.queryComponentDescriptions();
      setOptions(descriptions.map(d => ({ value: d.type, label: d.title })));
    })();
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

Setter.displayName = 'componentType';

export default Setter;
