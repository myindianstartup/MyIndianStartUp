import React from 'react';

const defaultLogoSrc = '/assets/myindianstartup-brand.png';

const BrandLogo = ({
  markClassName = 'h-11 w-11',
  textClassName = 'text-xl text-slate-950',
  showText = true,
  dark = false,
  logoSrc = defaultLogoSrc
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
        <span className="text-orange-500">MyIndian</span>
        <span className="text-blue-600">Startup</span>
      </span>
    )}
  </>
);

export default BrandLogo;
