import { memo, useContext, useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import { useSetterName } from '@lowcode-engine/dynamic-form';
import { ComponentDiscoveryContext } from '@lowcode-engine/core';
import { IComponentSetter } from '../../../models';
import * as _ from 'lodash';

const Setter: React.FC<IComponentSetter> = memo(props => {

  const { label, required, help, disabled, componentFilter } = props;
  const componentDiscovery = useContext(ComponentDiscoveryContext);
  const [options, setOptions] = useState<Array<{ value: string, label: string }>>();
  const name = useSetterName();

  useEffect(() => {
    (async () => {
      const descriptions = await componentDiscovery.queryComponentDescriptions();
      setOptions(descriptions.filter(d => {
        if (!componentFilter || !componentFilter.length) { return true; }
        return componentFilter.some(t => t === d.type);
      }).map(d => ({ value: d.type, label: d.title })));
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
