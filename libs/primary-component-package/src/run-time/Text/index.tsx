import { IDynamicComponentProps } from '@tiangong/core';
import { Input } from 'antd';
import { observer } from 'mobx-react-lite';
import React, { memo } from 'react';
import { ITextComponentConfiguration } from '../../models';
import styles from './index.module.less';

const Text: React.FC<IDynamicComponentProps<ITextComponentConfiguration>> = memo(observer(props => {

  const conf = props.configuration;
  const onChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    if (!conf.field) { return; }
    props.onChange(el.target.value);
  };
  return (
    <div className={styles['item']}>
      <label className={styles['item__title']}>{conf.title}</label>
      <Input placeholder={conf.placeholder || '请输入文本'} onChange={onChange} disabled={props.disabled} />
    </div>
  );
}));

Text.displayName = 'Text';

export default Text;