import React, { useEffect, useState } from 'react';
import { Copy, Percent, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const COUPON_CODE = 'AUGUST100';
const OFFER_DELAY_MS = 5000;

const CouponOfferPopup = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copyMessage, setCopyMessage] = useState('Click code or icon to copy');

  const isAdminArea = location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin');

  useEffect(() => {
    if (dismissed || isAdminArea) return undefined;

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, OFFER_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [dismissed, isAdminArea, location.pathname]);

  useEffect(() => {
    if (isAdminArea) setVisible(false);
  }, [isAdminArea]);

  const closePopup = () => {
    setVisible(false);
    setDismissed(true);
  };

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopyMessage(`Coupon copied: ${COUPON_CODE}`);
    } catch {
      setCopyMessage(`Coupon code: ${COUPON_CODE}`);
    }
  };

  if (dismissed || isAdminArea) return null;

  return (
    <aside
      className={`fixed inset-0 z-[100] grid place-items-center px-4 transition-opacity duration-300 ${
        visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-xl" />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-offer-title"
        className={`relative w-full max-w-[410px] overflow-hidden rounded-[1.5rem] border-[3px] border-black bg-[#fff3e1]/90 text-slate-950 shadow-[0_28px_80px_rgba(8,13,23,0.38)] backdrop-blur-2xl transition-transform duration-500 ${
          visible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-[0.98]'
        }`}
      >
        <div className="pointer-events-none absolute inset-2 rounded-[1rem] border border-white/60" />

        <button
          type="button"
          onClick={closePopup}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border-2 border-black/75 bg-white/40 text-slate-950 shadow-sm transition hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-orange-500/25"
          aria-label="Close offer notice"
        >
          <X className="h-4 w-4 stroke-[3]" />
        </button>

        <div className="relative z-[1] px-8 pb-7 pt-8 text-center sm:px-9">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-orange-700/15 bg-white/40 text-slate-950 shadow-sm">
            <Percent className="h-7 w-7 stroke-[3]" />
          </div>

          <div className="mx-auto mt-4 inline-flex rounded-full bg-white/50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-700">
            Limited Time Membership Offer
          </div>

          <h2
            id="coupon-offer-title"
            className="mt-5 text-[clamp(2.65rem,10vw,3.9rem)] font-black leading-none tracking-normal text-slate-950"
          >
            100% OFF
          </h2>

          <p className="mt-2 text-xl font-black tracking-normal text-orange-700">
            August Month Special
          </p>

          <p className="mx-auto mt-4 max-w-[330px] text-sm font-bold leading-6 text-slate-800">
            Start your BusinessVerse or CreatorVerse membership this month.
            Copy the coupon and apply it at checkout.
          </p>

          <button
            type="button"
            onClick={copyCoupon}
            className="mt-6 grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-white px-5 py-3 text-left text-slate-950 shadow-[0_18px_34px_rgba(8,13,23,0.16)] transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-600/20"
          >
            <span className="text-[clamp(1.35rem,5vw,1.75rem)] font-black tracking-[0.22em]">
              {COUPON_CODE}
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-[0.85rem] bg-blue-600 text-white">
              <Copy className="h-5 w-5 stroke-[2.6]" />
            </span>
          </button>

          <div className="mt-3 min-h-5 text-xs font-black text-slate-600">
            {copyMessage}
          </div>

          <Link
            to="/pricing"
            onClick={() => setVisible(false)}
            className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-orange-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-orange-500/20"
          >
            Go to Pricing
            <span className="ml-2" aria-hidden="true">→</span>
          </Link>

          <p className="mt-4 text-xs font-black text-slate-500">
            Offer ends August 31st
          </p>
        </div>
      </section>
    </aside>
  );
};

export default CouponOfferPopup;
