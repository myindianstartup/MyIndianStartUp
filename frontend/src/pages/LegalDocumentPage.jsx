import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const cleanText = (text = '') => text
  .replace(/Ã¢â€šÂ¹/g, 'Rs ')
  .replace(/â‚¹/g, 'Rs ')
  .replace(/Ã¢â‚¬Â¢/g, '-')
  .replace(/â€¢/g, '-')
  .replace(/•/g, '-')
  .replace(/_{6,}/g, '')
  .replace(/\r\n/g, '\n');

const normalizeLine = (line) => cleanText(line).replace(/\s+/g, ' ').trim();

const isHeadingLine = (line) => {
  if (!line || line.length > 130) return false;
  if (/^introduction$/i.test(line)) return true;
  if (/^(\d+[\).]|[A-Z]\.)\s+/.test(line)) return true;
  if (/^[A-Z0-9 &/(),.'-]+$/.test(line) && line.length > 4) return true;
  return false;
};

const stripHeadingPrefix = (line) => line.replace(/^(\d+[\).]|[A-Z]\.)\s+/, '');

const parseDocument = (rawText, title) => {
  const lines = cleanText(rawText)
    .split('\n')
    .map(normalizeLine)
    .filter(Boolean);

  const sections = [];
  const intro = [];
  const metadata = [];
  let current = null;

  lines.forEach((line, index) => {
    // Client documents use their own heading (for example "TERMS OF SERVICE")
    // which may differ from the public route title. It belongs in the page header,
    // not as an empty policy section.
    if (index === 0) return;

    if (index < 8 && /^last updated\s*:/i.test(line)) {
      metadata.push(line);
      return;
    }

    if (isHeadingLine(line)) {
      current = {
        heading: stripHeadingPrefix(line),
        body: []
      };
      sections.push(current);
      return;
    }

    if (!current && intro.length < 3) {
      intro.push(line);
      return;
    }

    if (!current) {
      current = { heading: 'Overview', body: [] };
      sections.push(current);
    }

    current.body.push(line);
  });

  return { intro, metadata, sections: sections.filter((section) => section.body.length > 0) };
};

const groupSectionBody = (body = []) => {
  const groups = [];
  let list = [];

  body.forEach((line, index) => {
    if (line.startsWith('-')) {
      list.push(line.replace(/^-\s*/, ''));
      return;
    }

    if (list.length) {
      groups.push({ type: 'list', items: list });
      list = [];
    }

    const isSubheading = line.length <= 70
      && line.split(' ').length <= 8
      && /^[A-Z]/.test(line)
      && !/[.!?;:]$/.test(line);

    groups.push(isSubheading
      ? { type: 'subheading', text: line }
      : { type: 'paragraph', text: line });
  });

  if (list.length) {
    groups.push({ type: 'list', items: list });
  }

  return groups;
};

const LegalDocumentPage = ({ title, source, summary }) => {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('loading');
  const [activeIndex, setActiveIndex] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    let active = true;

    setStatus('loading');
    setActiveIndex(0);

    fetch(source)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load ${title}`);
        }
        return response.text();
      })
      .then((text) => {
        if (!active) return;
        setContent(text);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [source, title]);

  const parsed = useMemo(() => parseDocument(content, title), [content, title]);
  const introText = parsed.intro.length ? parsed.intro.join(' ') : summary;
  const sections = parsed.sections.length ? parsed.sections : [{ heading: title, body: [introText] }];
  const activeSection = sections[Math.min(activeIndex, sections.length - 1)] || sections[0];
  const activeGroups = groupSectionBody(activeSection?.body || []);
  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < sections.length - 1;

  const selectSection = (index) => {
    setActiveIndex(index);
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to website
        </Link>

        <div className="mt-7 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_22px_80px_rgba(15,23,42,0.07)] sm:p-8 lg:p-10">
          <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-800">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">Official policy</span>
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.12] tracking-[-0.03em] text-slate-950 sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-3xl text-base font-semibold leading-8 text-slate-600 sm:text-lg">
                {introText}
              </p>
              <p className="mt-4 text-sm font-semibold text-slate-500">Last modified: 1 July 2026</p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-950">Policy reader</p>
                  <p className="text-sm font-semibold leading-6 text-slate-500">
                    Choose a section to read only the policy details you need.
                  </p>
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-900">
                <span className="text-xl font-black">{sections.length}</span>
                <span>policy sections</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-20 sm:px-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-10">
        {status === 'ready' && (
          <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Policy sections</div>
            <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] lg:block lg:max-h-[calc(100vh-12rem)] lg:space-y-2 lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 lg:pr-1">
              {sections.map((section, index) => {
                const isActive = activeIndex === index;

                return (
                  <button
                    key={`${section.heading}-nav-${index}`}
                    type="button"
                    title={section.heading}
                    onClick={() => selectSection(index)}
                    className={`flex min-w-[230px] items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-extrabold leading-5 transition lg:w-full lg:min-w-0 ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                      isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 truncate whitespace-nowrap">{section.heading}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        <main ref={contentRef} className="min-w-0 scroll-mt-28">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
            {status === 'loading' && (
              <div className="space-y-5">
                <div className="h-5 w-64 animate-pulse rounded-full bg-slate-100" />
                <div className="h-32 animate-pulse rounded-3xl bg-slate-100" />
                <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
              </div>
            )}

            {status === 'error' && (
              <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-700">
                We could not load this document right now. Please refresh the page.
              </div>
            )}

            {status === 'ready' && (
              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-700">
                    {String(activeIndex + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                      Section {String(activeIndex + 1).padStart(2, '0')} of {String(sections.length).padStart(2, '0')}
                    </p>
                    <h2 className="mt-2 text-3xl font-black leading-[1.15] tracking-[-0.02em] text-slate-950 sm:text-4xl">
                      {activeSection.heading}
                    </h2>
                  </div>
                </div>

                <div className="mt-7 space-y-5">
                  {activeGroups.length ? activeGroups.map((group, groupIndex) => {
                    if (group.type === 'subheading') {
                      return (
                        <h3
                          key={`${activeSection.heading}-subheading-${groupIndex}`}
                          className="pt-2 text-lg font-black text-slate-950 sm:text-xl"
                        >
                          {group.text}
                        </h3>
                      );
                    }

                    if (group.type === 'list') {
                      return (
                        <ul key={`${activeSection.heading}-list-${groupIndex}`} className="grid gap-3 md:grid-cols-2">
                          {group.items.map((item, itemIndex) => (
                            <li
                              key={`${item}-${itemIndex}`}
                              className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700"
                            >
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    return (
                      <p
                        key={`${activeSection.heading}-p-${groupIndex}`}
                        className="text-base font-medium leading-8 text-slate-600 sm:text-lg"
                      >
                        {group.text}
                      </p>
                    );
                  }) : null}
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    disabled={!canGoPrevious}
                    onClick={() => selectSection(activeIndex - 1)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous topic
                  </button>
                  <button
                    type="button"
                    disabled={!canGoNext}
                    onClick={() => selectSection(activeIndex + 1)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next topic
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            )}
          </div>
        </main>
      </section>
    </div>
  );
};

export default LegalDocumentPage;
