import { useContext } from 'react';
import { Form, Select } from 'antd';
import { IComponentActionSetter } from '../../../models';
import { observer } from 'mobx-react-lite';
import { EditorContext } from '@lowcode-engine/editor';
import { useSetterName } from '@lowcode-engine/dynamic-form';

const Setter: React.FC<IComponentActionSetter> = observer(props => {

  const { label, required, help, disabled } = props;
  // const { store } = useContext(EditorContext);
  // const infos = store.configurationStore.selectAllComponentBasicInfo();
  // const components = infos.map(f => ({ value: f.id, label: f.title }))
  const name = useSetterName();

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required, message: help }]}
    >
      <Select disabled={disabled} options={[]} />
    </Form.Item>
  );
});

Setter.displayName = 'componentType';

export default Setter;
