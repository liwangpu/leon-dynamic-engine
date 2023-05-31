import { IDynamicComponentProps } from '@lowcode-engine/core';
import { Input } from 'antd';
import React, { memo } from 'react';
import { ITextComponentConfiguration } from '../../../models';
import styles from './index.module.less';

const Text: React.FC<IDynamicComponentProps<ITextComponentConfiguration>> = memo(props => {

  const { title, field, placeholder } = props.configuration;

  // console.log(`text conf:`, props.configuration, props.style);

  const onChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    if (!field) { return; }
    props.onChange(el.target.value);
  };
  return (
    <div className={styles['item']} style={props.style}>
      <label className={styles['item__title']}>{title}</label>
      <Input placeholder={placeholder || '请输入文本'} onChange={onChange} disabled={props.disabled} />
    </div>
  );
});

Text.displayName = 'Text';

export default Text;