import { SetterType } from '../enums';


export interface IStringSetter {
  type: SetterType.string
}


export type Setter = IStringSetter;