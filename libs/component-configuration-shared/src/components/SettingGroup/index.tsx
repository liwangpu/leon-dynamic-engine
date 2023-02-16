import { memo } from 'react';
import { observer } from 'mobx-react-lite';

export type SettingGroupProps = {
  title: string;
  children?: React.ReactNode;
};

export const SettingGroup: React.FC<SettingGroupProps> = memo(observer(props => {
  return (
    <div className='configuration-setting-group'>
      {props.title && (
        <label className='configuration-setting-group__title'>{props.title}</label>
      )}
      {props.children && (
        <div className='configuration-setting-group__content'>
          {props.children}
        </div>
      )}
    </div>
  );
}));

SettingGroup.displayName = 'SettingGroup';

