import React from 'react';

const Section = ({
  id,
  tag,
  title,
  description,
  className = '',
  bgType = 'white', // 'white', 'light', 'dark'
  tagColor = 'blue',
  children
}) => {
  let sectionClass = 'py-24 md:py-32 transition-colors duration-350';
  if (bgType === 'light') sectionClass += ' bg-[#F8FAFC]';
  if (bgType === 'dark') sectionClass += ' bg-slate-950 text-white';
  if (bgType === 'white') sectionClass += ' bg-white';
  if (className) sectionClass += ` ${className}`;

  return (
    <section id={id} className={sectionClass}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {(tag || title || description) && (
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            {tag && (
              <span className={`uppercase tracking-[0.2em] text-xs sm:text-sm font-semibold mb-4 block ${tagColor === 'orange' ? 'text-orange-600' : 'text-blue-600'}`}>
                {tag}
              </span>
            )}
            {title && <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter leading-none font-black text-slate-900 mb-6">{title}</h2>}
            {description && <p className="text-base sm:text-lg leading-relaxed text-slate-600 max-w-2xl mx-auto">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
