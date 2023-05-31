import { IDynamicComponentProps } from '@lowcode-engine/core';
import { InputNumber } from 'antd';
import * as  _ from 'lodash';
import React, { memo } from 'react';
import { ITextComponentConfiguration } from '../../../models';
import styles from './index.module.less';

const Number: React.FC<IDynamicComponentProps<ITextComponentConfiguration>> = memo(props => {

  const { title, field, placeholder } = props.configuration;

  const onChange = (val: number) => {
    if (!field) { return; }
    if (!_.isFunction(props.onChange)) { return; }
    props.onChange(val);
  };

  return (
    <div className={styles['item']} style={props.style}>
      <label className={styles['item__title']}>{title}</label>
      <InputNumber className={styles['item__input']} placeholder={placeholder || '请输入数值'} value={props.value} onChange={onChange} />
    </div>
  );
});

Number.displayName = 'Number';

export default Number;