import { useContext, useMemo } from 'react';
import { Form, Select } from 'antd';
import { IComponentSetter } from '../../../models';
import { observer } from 'mobx-react-lite';
import * as _ from 'lodash';
import { EditorContext } from '@lowcode-engine/editor';
import { useSetterName } from '@lowcode-engine/dynamic-form';

const Setter: React.FC<IComponentSetter> = observer(props => {

  const { label, required, help, disabled, componentFilter } = props;
  const { store } = useContext(EditorContext);
  const infos = store.configurationStore.selectAllComponentBasicInfo();

  const components = useMemo<Array<{ value: string; label: string }>>(() => {
    return infos
      .filter(f => {
        if (!componentFilter) {
          return true;
        }

        if (_.isString(componentFilter)) {
          return f.type === componentFilter;
        }

        if (_.isArray(componentFilter)) {
          return componentFilter.some(t => t === f.type);
        }
      })
      .map(f => ({ value: f.id, label: f.title }));
  }, [componentFilter]);

  const name = useSetterName();


  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required, message: help }]}
    >
      <Select disabled={disabled} options={components} />
    </Form.Item>
  );
});

Setter.displayName = 'componentType';

export default Setter;
