import { IComponentConfiguration } from '@lowcode-engine/core';

export interface IVideoPlayerComponentConfiguration extends IComponentConfiguration {
  vedioUrl?: string;
  showControl?: boolean;
}