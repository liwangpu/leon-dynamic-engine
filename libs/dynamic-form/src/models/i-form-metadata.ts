import { Observable } from 'rxjs';
import { ISetter } from './i-setter';

export interface IFormMetadata {
  title?: string;
  children: Array<ISetter>;
  onLoad?: (initValue: any, valueChange$: Observable<{ [key: string]: any }>) => Promise<void>;
  onDestroy?: () => Promise<void>;
  onChange?: (value: { [key: string]: any }) => Promise<{ [key: string]: any }>;
}