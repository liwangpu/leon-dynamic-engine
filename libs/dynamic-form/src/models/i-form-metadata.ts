import { Observable } from 'rxjs';
import { ISetter } from './i-setter';

export interface IFormMetadata {
  children: Array<ISetter>;
  onLoad?: ( valueChange$: Observable<{[key:string]:any}>) => Promise<void>;
  onDestroy?: () => Promise<void>;
  onChange?: (value: {[key:string]:any}) => Promise<{[key:string]:any}>;
}