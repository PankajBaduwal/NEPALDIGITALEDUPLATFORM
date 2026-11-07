import React from 'react';

export interface NepalEduLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'horizontal' | 'vertical' | 'symbol-only' | 'white';
  showTagline?: boolean;
  title?: string;
  className?: string;
  onClick?: () => void;
}

/** Brand logo (same artwork as the homepage header). `white` = light version for dark backgrounds. */
export const NepalEduLogo: React.FC<NepalEduLogoProps> = ({ size = 'md', variant = 'horizontal', className = '', onClick }) => {
  const isWhite = variant === 'white';
  const isSymbol = variant === 'symbol-only';
  const isVertical = variant === 'vertical';

  const horizontalH = { sm: 30, md: 40, lg: 52, xl: 68 }[size];
  const symbolH = { sm: 34, md: 46, lg: 58, xl: 74 }[size];
  const stackedH = { sm: 70, md: 96, lg: 124, xl: 160 }[size];

  const file = isSymbol
    ? isWhite ? 'icon-dark.svg' : 'icon.svg'
    : isVertical
      ? isWhite ? 'logo-stacked-dark.svg' : 'logo-stacked.svg'
      : isWhite ? 'logo-horizontal-dark.svg' : 'logo-horizontal.svg';
  const height = isSymbol ? symbolH : isVertical ? stackedH : horizontalH;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', cursor: onClick ? 'pointer' : 'default' }}
    >
      <img src={`/brand/logo/${file}`} alt="Nepal Digital Education Platform" style={{ height, width: 'auto', display: 'block' }} />
    </div>
  );
};

export default NepalEduLogo;
