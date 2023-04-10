import { IDynamicComponentProps } from '@lowcode-engine/core';
import React, { memo } from 'react';
import { ITextComponentConfiguration } from '../../../models';
import styles from './index.module.less';

const TextArea: React.FC<IDynamicComponentProps<ITextComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  return (
    <div className={styles['text']}>
      <label className={styles['text__title']}>{conf.title}</label>
      <div className={styles['text__input']}>
        {conf.placeholder || '请输入文本'}
      </div>
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;