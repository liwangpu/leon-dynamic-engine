import styles from './index.module.less';
import { IDynamicComponentProps } from '@lowcode-engine/core';
import React, { memo } from 'react';
import { IImageViewerComponentConfiguration } from '../../../models';

const ImageViewer: React.FC<IDynamicComponentProps<IImageViewerComponentConfiguration>> = memo(props => {

  const { title, imageUrl } = props.configuration;
  console.log(`image view conf:`, props.configuration);

  return (
    <div className={styles['image-viewer']}>
      <p className={styles['image-viewer__title']}>{title}</p>
      <div className={styles['image-viewer__image']}>
        {imageUrl && (
          <img src={imageUrl} />
        )}
      </div>
    </div>
  );
});

ImageViewer.displayName = 'ImageViewer';

export default ImageViewer;