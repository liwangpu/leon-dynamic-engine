import { memo } from 'react';
import styles from './index.module.less';
import { Form, Radio } from 'antd';
import { ISetterBase } from '../../../models';
import { GridSystemSection } from '../../../enums';

const options = [
  { label: '1/4', value: GridSystemSection['1/4'] },
  { label: '1/3', value: GridSystemSection['1/3'] },
  { label: '1/2', value: GridSystemSection['1/2'] },
  { label: '2/3', value: GridSystemSection['2/3'] },
  { label: '3/4', value: GridSystemSection['3/4'] },
  { label: '1', value: GridSystemSection['1/1'] },
];

const Setter: React.FC<ISetterBase> = memo(props => {

  const { label, name, required, help } = props;
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required, message: help }]}
    >
      <Radio.Group className={styles['grid-section']} options={options} optionType="button" />
    </Form.Item>
  );
});

Setter.displayName = 'gridColumnSpan';

export default Setter;

