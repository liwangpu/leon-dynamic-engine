import registerListPageMetadata from './list-page';
import registerTextMetadata from './text';
import registerBlockMetadata from './block';
import registerTableMetadata from './table';
import registerNumberMetadata from './number';
import registerButtonMetadata from './button';

export default function RegisterConfigurationMetadata(): void {
  registerListPageMetadata();
  registerTextMetadata();
  registerBlockMetadata();
  registerTableMetadata();
  registerNumberMetadata();
  registerButtonMetadata();
}