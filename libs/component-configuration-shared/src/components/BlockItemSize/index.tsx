import styles from './index.module.less';
import { Radio } from 'antd';
import { forwardRef, memo, ForwardedRef } from 'react';
import { observer } from 'mobx-react-lite';
import { IInputProp } from '../../models';
import { GridSystemSection } from '../../enums';

export const BlockItemSize = observer(forwardRef<ForwardedRef<any>, IInputProp>((props, ref) => {

  const options = [
    { label: '1/4', value: GridSystemSection['1/4'] },
    { label: '1/3', value: GridSystemSection['1/3'] },
    { label: '1/2', value: GridSystemSection['1/2'] },
    { label: '2/3', value: GridSystemSection['2/3'] },
    { label: '3/4', value: GridSystemSection['3/4'] },
    { label: '1', value: GridSystemSection['1/1'] },
  ];
  return (
    <div className={styles['config-item']}>
      <Radio.Group className={styles['grid-section']} options={options} onChange={props.onChange} value={props.value} optionType="button" />
    </div >
  );
}));

BlockItemSize.displayName = 'BlockItemSize';
