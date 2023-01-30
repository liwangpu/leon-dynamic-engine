import { IDynamicComponentProps } from '@tiangong/core';
import { InputNumber } from 'antd';
import { observer } from 'mobx-react-lite';
import React, { memo } from 'react';
import { ITextComponentConfiguration } from '../../models';
import styles from './index.module.less';

const Number: React.FC<IDynamicComponentProps<ITextComponentConfiguration>> = memo(observer(props => {

  const conf = props.configuration;

  const onChange = (val: number) => {
    if (!conf.field) { return; }
    props.onChange(val);
  };

  return (
    <div className={styles['item']}>
      <label className={styles['item__title']}>{conf.title}</label>
      <InputNumber className={styles['item__input']} placeholder={conf.placeholder || '请输入数值'} value={props.value} onChange={onChange} />
    </div>
  );
}));

Number.displayName = 'Number';

export default Number;