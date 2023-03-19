import styles from './index.module.less';
import { IDynamicComponentProps, useEventCenter } from '@lowcode-engine/core';
import React, { memo, useEffect, useRef } from 'react';
import { IVideoPlayerComponentConfiguration } from '../../../models';

const VideoPlayer: React.FC<IDynamicComponentProps<IVideoPlayerComponentConfiguration>> = memo(props => {

  const { title, vedioUrl, showControl } = props.configuration;
  const { registerAction, disconnect } = useEventCenter(props.configuration);
  const videoPlayerRef = useRef<any>();

  registerAction({
    type: 'start',
    title: '开始',
  }, async () => {

  });

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className={styles['video-player']}>
      <p>{title}</p>
      {vedioUrl && (
        <video className={styles['video-player__video']} src={vedioUrl} controls={showControl} ref={videoPlayerRef} muted >
          您的浏览器不支持 video 标签。
        </video>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;