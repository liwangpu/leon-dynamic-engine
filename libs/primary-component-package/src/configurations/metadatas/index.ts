import registerListPageMetadata from './list-page';
import registerTextMetadata from './text';
import registerBlockMetadata from './block';
import registerTableMetadata from './table';
import registerNumberMetadata from './number';
import registerButtonMetadata from './button';
import registerButtonGroupMetadata from './button-group';

export default function RegisterConfigurationMetadata(): void {
  registerListPageMetadata();
  registerTextMetadata();
  registerBlockMetadata();
  registerTableMetadata();
  registerNumberMetadata();
  registerButtonMetadata();
  registerButtonGroupMetadata();
}