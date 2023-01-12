import { observer } from 'mobx-react-lite';
import React, { memo } from 'react';
import styles from './index.module.less';

interface IAreaSetting {
  enable?: boolean;
  width?: string;
}

export interface ThreeColumnStretch {
  leftAreaSetting?: IAreaSetting;
  rightAreaSetting?: IAreaSetting;
  leftArea?: React.ReactNode;
  middleArea?: React.ReactNode;
  rightArea?: React.ReactNode;
}

const ThreeColumnStretch: React.FC<ThreeColumnStretch> = memo(observer(props => {
  const leftAreaSetting: IAreaSetting = props.leftAreaSetting || {};
  const rightAreaSetting: IAreaSetting = props.rightAreaSetting || {};

  return (
    <div className={styles['stretch']}>
      {leftAreaSetting.enable && (
        <div className={styles['stretch__left-area']}>
          {props.leftArea}
        </div>
      )}
      <div className={styles['stretch__middle-area']}>{props.middleArea}</div>
      {rightAreaSetting.enable && (
        <div className={styles['stretch__right-area']}>
          {props.rightArea}
        </div>
      )}
    </div>
  );
}));

ThreeColumnStretch.displayName = 'ThreeColumnStretch';

export default ThreeColumnStretch;