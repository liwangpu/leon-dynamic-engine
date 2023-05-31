import { IDynamicComponentProps } from '@lowcode-engine/core';
import { Input } from 'antd';
import React, { memo } from 'react';
import { ITextComponentConfiguration } from '../../../models';
import styles from './index.module.less';

const { TextArea: AntdTextArea } = Input;

const TextArea: React.FC<IDynamicComponentProps<ITextComponentConfiguration>> = memo(props => {

  const { title, field, placeholder } = props.configuration;
  const onChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    if (!field) { return; }
    props.onChange(el.target.value);
  };
  return (
    <div className={styles['item']} style={props.style}>
      <label className={styles['item__title']}>{title}</label>
      <AntdTextArea className={styles['item__content']} placeholder={placeholder || '请输入文本'} disabled={props.disabled} />
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;