import React from 'react';

const logoSrc = '/assets/myindianstartup-logo.svg';

const BrandLogo = ({
  markClassName = 'h-11 w-11',
  textClassName = 'text-xl text-slate-950',
  accentClassName = 'text-blue-600',
  showText = true,
  dark = false
}) => (
  <>
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${markClassName}`}
    >
      <img
        src={logoSrc}
        alt=""
        aria-hidden="true"
        className="h-full w-full object-contain"
      />
    </span>
    {showText && (
      <span className={`font-black tracking-[-0.045em] ${textClassName}`}>
        MyIndian<span className={accentClassName}>Startup</span>
      </span>
    )}
  </>
);

export default BrandLogo;
