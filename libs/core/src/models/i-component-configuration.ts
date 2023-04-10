export interface IComponentConfiguration {
  id: string;
  type: string | null;
  code?: string;
  title?: string;
  height?: string;
  fullHeight?: boolean;
  width?: string;
  // validators?: ComponentValidatorRule[];
  // eventBindings?: IComponentEventBinding[];
  // size?: { width?: number; height?: number; };
  gridColumnSpan?: string;
  gridRowSpan?: number;
  children?: IComponentConfiguration[];
  [key: string]: any;
}

export interface IComponentConfigurationProvider<T = IComponentConfiguration> {
  (partial: PartialComponentConfiguration & T): Promise<PartialComponentConfiguration & T>;
};

export type PartialComponentConfiguration = { [P in keyof IComponentConfiguration]?: IComponentConfiguration[P] };
export interface IComponentConfigurationProvider<T = IComponentConfiguration> {
  (partial: PartialComponentConfiguration & T): Promise<PartialComponentConfiguration & T>;
};
