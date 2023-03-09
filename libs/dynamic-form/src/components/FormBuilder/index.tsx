import React, { memo } from 'react';
import { IFormMetadata } from '../../models';
import styles from './index.module.less';

export interface IFormBuilderProps {
  metadata: IFormMetadata;
}

export const FormBuilder: React.FC<IFormBuilderProps> = memo(props => {

  return (
    <div className={styles['builder']}>
      form builder
      <p>{JSON.stringify(props.metadata)}</p>
    </div>
  );
});

FormBuilder.displayName = 'FormBuilder';