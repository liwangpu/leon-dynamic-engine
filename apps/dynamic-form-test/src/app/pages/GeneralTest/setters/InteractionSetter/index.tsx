import React, { memo } from 'react';


export const SimpleComponent: React.FC = memo(props => {

  return (
    <div>

    </div>
  );
});

SimpleComponent.displayName = 'SimpleComponent';