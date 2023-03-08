import { CloseOutlined } from '@ant-design/icons';
import { LeftAreaPluginContext } from '@lowcode-engine/editor';
import { Button } from 'antd';
import { memo, useContext } from 'react';
import styles from './index.module.less';

const GalleryHeader: React.FC<{ title: string }> = memo(({ title }) => {
  const pluginCtx = useContext(LeftAreaPluginContext);
  return (
    <div className={styles['gallery-header']}>
      <p className={styles['gallery-header__title']}>{title}</p>
      <Button type="text" shape="circle" size='small' onClick={() => pluginCtx.close()}>
        <CloseOutlined />
      </Button>
    </div>
  );
});

GalleryHeader.displayName = 'GalleryHeader';

export default GalleryHeader;