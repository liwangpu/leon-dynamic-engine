import styles from './index.module.less';
import { Button as AntdButton, Form, Input } from 'antd';
import { memo } from 'react';
import { IComponentConfigurationPanelProps } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';

export type ConfigItemProps = {
  title: string;
  children?: React.ReactNode;
};

export const ConfigItem: React.FC<ConfigItemProps> = memo(observer(props => {
  return (
    <div className={styles['config-item']}>
      {props.title && (
        <label className={styles['config-item__title']}>{props.title}</label>
      )}
      {props.children && (
        <div className={styles['config-item__value']}>
          {props.children}
        </div>
      )}
    </div >
  );
}));

