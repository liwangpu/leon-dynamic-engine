import React, { memo, useContext, useMemo } from 'react';
import { EditorContext } from '@lowcode-engine/editor';
import * as _ from 'lodash';
import { observer } from 'mobx-react-lite';
import { ITabSelectSetter } from '../../models';
import { ComponentTypes } from '../../enums';
import { Checkbox, Form, Select } from 'antd';

interface ISelectBoxValue {
  data: {
    value: string;
    label: string;
  };
}

const SelectorWrapper: React.FC<{ value?: string, onChange?: (val: string) => void, multiple?: boolean }> = observer(({ value, onChange, multiple }) => {

  const { store } = useContext(EditorContext);
  const infos = store.configurationStore.selectAllComponentBasicInfo([ComponentTypes.tab, ComponentTypes.tabs]);
  // console.log(`infos:`, infos);
  // console.log(`tabsGroupEnabledInfos:`, tabsGroupEnabledInfos);

  const components = useMemo<Array<{ value: string; label: string }>>(() => {
    return infos
      .filter(f => f.type === ComponentTypes.tab)
      .map(f => {
        // console.log(`f:`, f);
        return { value: f.id, label: f.title };
      });
  }, [infos]);

  const handleChange = (val: ISelectBoxValue | Array<ISelectBoxValue>) => {
    if (_.isFunction(onChange)) {
      onChange(val);
    }
  };

  return (
    <Select
      placeholder="请选择"
      style={{ width: '100%' }}
      mode={multiple ? 'multiple' : null}
      options={components}
      value={value as any}
      onChange={handleChange}
    // valueField="value"
    // textField="label"
    />
  );
});

SelectorWrapper.displayName = 'SelectorWrapper';

const Setter: React.FC<ITabSelectSetter> = memo(props => {
  const { name, multiple } = props;

  return (
    <Form.Item
      name={name}
    >
      <SelectorWrapper multiple={multiple} />
    </Form.Item>
  );
});

Setter.displayName = 'SelectSetter';

export default Setter;
