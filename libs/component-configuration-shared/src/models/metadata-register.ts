import { IEditorContext, ISetterPanelContext } from '@lowcode-engine/editor';
import { IFormMetadata } from '@lowcode-engine/dynamic-form';

export interface IFormMetadataGenerator {
  (editorContext: IEditorContext): Promise<IFormMetadata>;
}


export interface IMetadataRegister {
  (register: (context: ISetterPanelContext, generator: IFormMetadataGenerator) => void): void;
} 