import { CloseOutlined } from '@ant-design/icons';
import { LeftAreaPluginContext } from '@lowcode-engine/editor';
import { Button } from 'antd';
import React, { memo, useContext } from 'react';
import styles from './index.module.less';

const GalleryHeader: React.FC<{ title: string, children?: React.ReactNode }> = memo(({ title, children }) => {
  const pluginCtx = useContext(LeftAreaPluginContext);
  return (
    <div className={styles['gallery-header']}>
      <p className={styles['gallery-header__title']}>{title}</p>
      {children}
      <Button type="text" shape="circle" size='small' onClick={() => pluginCtx.close()}>
        <CloseOutlined />
      </Button>
    </div>
  );
});

GalleryHeader.displayName = 'GalleryHeader';

export default GalleryHeader;