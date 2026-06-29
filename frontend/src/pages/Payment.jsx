import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CalendarDays, Check, CreditCard, Loader2, ShieldCheck, Sparkles, Tag, UserRound } from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const formatCurrency = (value) => `Rs ${new Intl.NumberFormat('en-IN').format(value || 0)}`;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatDate = (value) => {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not available';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(parsed);
};

const emptyBilling = {
  fullName: '',
  email: '',
  phone: '',
  gstNumber: '',
  address: ''
};

const fallbackPlans = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    code: 'BUSINESSVERSE_ANNUAL',
    name: 'BusinessVerse Annual Membership',
    description: 'Business listing, daily visibility, creator discovery, and direct collaboration.',
    account_type: 'business',
    amount_inr: 999,
    duration_days: 365
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    code: 'CREATORVERSE_ANNUAL',
    name: 'CreatorVerse Annual Membership',
    description: 'Creator listing, portfolio visibility, business discovery, and direct collaboration.',
    account_type: 'creator',
    amount_inr: 999,
    duration_days: 365
  }
];

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (typeof window === 'undefined') {
    reject(new Error('Razorpay checkout is only available in the browser.'));
    return;
  }

  if (window.Razorpay) {
    resolve(window.Razorpay);
    return;
  }

  const existingScript = document.querySelector('script[data-razorpay-checkout="true"]');
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(window.Razorpay), { once: true });
    existingScript.addEventListener('error', () => reject(new Error('Could not load Razorpay checkout.')), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.dataset.razorpayCheckout = 'true';
  script.onload = () => resolve(window.Razorpay);
  script.onerror = () => reject(new Error('Could not load Razorpay checkout.'));
  document.body.appendChild(script);
});

const Payment = () => {
  const { token, member, user, isAuthenticated, refreshMember, session } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [quote, setQuote] = useState(null);
  const [billingInfo, setBillingInfo] = useState(emptyBilling);
  const [loading, setLoading] = useState(true);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        const data = await apiRequest('/api/subscriptions/plans');
        setPlans(data.plans || []);
        const preferred = data.plans?.find((plan) => plan.account_type === member?.account_type) || data.plans?.[0];
        setSelectedPlanId(preferred?.id || '');
      } catch (requestError) {
        const preferred = fallbackPlans.find((plan) => plan.account_type === member?.account_type) || fallbackPlans[0];
        setPlans(fallbackPlans);
        setSelectedPlanId(preferred?.id || '');
        setError('');
        if (requestError.code === 'NETWORK_ERROR') {
          setMessage('Pricing is visible. Start the backend to enable live checkout and coupon validation locally.');
        } else {
          setError(requestError.message || 'Could not load membership plans.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [member?.account_type]);

  useEffect(() => {
    setQuote(null);
    setMessage('');
  }, [selectedPlanId]);

  useEffect(() => {
    const fallbackName = user?.email ? user.email.split('@')[0] : '';
    const nextDefaults = {
      fullName: member?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || fallbackName,
      email: member?.email || user?.email || '',
      phone: member?.mobile_number || user?.user_metadata?.mobile_number || '',
      gstNumber: '',
      address: ''
    };

    setBillingInfo((current) => ({
      fullName: current.fullName || nextDefaults.fullName || '',
      email: current.email || nextDefaults.email || '',
      phone: current.phone || nextDefaults.phone || '',
      gstNumber: current.gstNumber || '',
      address: current.address || ''
    }));
  }, [member?.email, member?.full_name, member?.mobile_number, user?.email, user?.user_metadata]);

  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedPlanId), [plans, selectedPlanId]);
  const finalAmount = quote?.finalAmountInr ?? selectedPlan?.amount_inr ?? 0;
  const discount = quote?.discountAmountInr ?? 0;
  const hasActiveMembership = ['active', 'trialing', 'paid'].includes(String(member?.subscription_status || '').toLowerCase());
  const isFullDiscountCoupon = Boolean(
    quote?.valid
    && quote?.coupon
    && quote.coupon.discount_type === 'percentage'
    && Number(quote.coupon.discount_value) === 100
    && Number(finalAmount) === 0
  );

  const normalizedBillingInfo = useMemo(() => ({
    fullName: billingInfo.fullName.trim(),
    email: billingInfo.email.trim().toLowerCase(),
    phone: billingInfo.phone.trim(),
    gstNumber: billingInfo.gstNumber.trim(),
    address: billingInfo.address.trim()
  }), [billingInfo]);

  const buildCheckoutBillingInfo = () => {
    const payload = {};

    if (normalizedBillingInfo.fullName) payload.fullName = normalizedBillingInfo.fullName;
    if (normalizedBillingInfo.email) payload.email = normalizedBillingInfo.email;
    if (normalizedBillingInfo.phone) payload.phone = normalizedBillingInfo.phone;
    if (normalizedBillingInfo.gstNumber) payload.gstNumber = normalizedBillingInfo.gstNumber;
    if (normalizedBillingInfo.address) payload.address = normalizedBillingInfo.address;

    return payload;
  };

  const validateBillingInfo = () => {
    if (!normalizedBillingInfo.fullName) {
      return 'Billing name is required.';
    }
    if (normalizedBillingInfo.fullName.length < 2) {
      return 'Please enter a valid billing name (at least 2 characters).';
    }

    if (!normalizedBillingInfo.email) {
      return 'Billing email is required.';
    }
    if (!emailPattern.test(normalizedBillingInfo.email)) {
      return 'Please enter a valid billing email address.';
    }

    if (!normalizedBillingInfo.phone) {
      return 'Phone number is required.';
    }
    const cleanPhone = normalizedBillingInfo.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return 'Please enter a valid 10-digit phone number.';
    }

    if (!normalizedBillingInfo.address) {
      return 'Billing address is required.';
    }
    if (normalizedBillingInfo.address.length < 5) {
      return 'Please enter a complete billing address (at least 5 characters).';
    }

    if (normalizedBillingInfo.gstNumber) {
      const cleanGst = normalizedBillingInfo.gstNumber.replace(/\s/g, '');
      if (cleanGst.length !== 15 || !/^[a-zA-Z0-9]{15}$/.test(cleanGst)) {
        return 'Please enter a valid 15-character GST number, or leave it empty.';
      }
    }

    return '';
  };

  const applyCoupon = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedPlanId || hasActiveMembership) return;

    setCheckingCoupon(true);
    setError('');
    setMessage('');
    try {
      const data = await apiRequest('/api/subscriptions/validate-coupon', {
        method: 'POST',
        token,
        body: { planId: selectedPlanId, couponCode }
      });
      setQuote(data.quote);
      if (data.quote.valid && data.quote.coupon) {
        setMessage(`${data.quote.coupon.code} applied successfully.`);
      } else if (!data.quote.valid) {
        setError(data.quote.reason || 'Coupon is not valid.');
      } else {
        setMessage('Price calculated without coupon.');
      }
    } catch (requestError) {
      setError(requestError.message || 'Could not validate coupon.');
    } finally {
      setCheckingCoupon(false);
    }
  };

  const createCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedPlanId) return;
    if (hasActiveMembership) {
      navigate('/post-verse');
      return;
    }

    const billingValidationError = validateBillingInfo();
    if (billingValidationError) {
      setError(billingValidationError);
      setMessage('');
      return;
    }

    setCreatingOrder(true);
    setError('');
    setMessage('');
    try {
      const data = await apiRequest('/api/subscriptions/checkout', {
        method: 'POST',
        token,
        body: {
          planId: selectedPlanId,
          couponCode: couponCode.trim() || null,
          billingInfo: buildCheckoutBillingInfo()
        }
      });

      setQuote(data.quote);
      if (data.freeCheckout && data.razorpay?.skipped) {
        setMessage('100% coupon applied. Razorpay skipped and your 1-year membership is active from today.');
        if (session) {
          await refreshMember(session);
        }
        navigate('/post-verse', { replace: true });
        return;
      }

      const razorpayKey = String(process.env.REACT_APP_RAZORPAY_KEY_ID || '').trim();
      if (!razorpayKey) {
        throw new Error('Razorpay public key is missing. Please set REACT_APP_RAZORPAY_KEY_ID in the frontend environment.');
      }

      await loadRazorpayCheckout();
      if (!window.Razorpay) {
        throw new Error('Razorpay checkout did not load correctly. Please refresh and try again.');
      }

      const paymentObject = new window.Razorpay({
        key: razorpayKey,
        amount: data.razorpay.amountInPaise,
        currency: data.razorpay.currency || 'INR',
        name: 'MyIndianStartup',
        description: selectedPlan?.name || 'Annual Membership',
        order_id: data.razorpay.providerOrderId,
        prefill: {
          name: normalizedBillingInfo.fullName,
          email: normalizedBillingInfo.email,
          contact: normalizedBillingInfo.phone
        },
        notes: {
          gstNumber: normalizedBillingInfo.gstNumber,
          address: normalizedBillingInfo.address,
          accountType: member?.account_type || ''
        },
        theme: {
          color: '#2563EB'
        },
        handler: async (response) => {
          try {
            setMessage('Payment received. Verifying and activating your membership...');
            setError('');

            await apiRequest('/api/subscriptions/razorpay/verify', {
              method: 'POST',
              token,
              body: response
            });

            if (session) {
              await refreshMember(session);
            }

            setMessage('Payment successful. Your membership is now active.');
            navigate('/post-verse', { replace: true });
          } catch (verificationError) {
            setError(verificationError.message || 'Payment succeeded, but verification is still pending. Please contact support if access does not update soon.');
            setMessage('');
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment checkout was cancelled.');
            setMessage('');
          }
        }
      });

      paymentObject.on('payment.failed', (response) => {
        const reason = response?.error?.description || response?.error?.reason || 'Payment failed. Please try again.';
        setError(reason);
        setMessage('');
      });

      paymentObject.open();
    } catch (requestError) {
      if ((requestError.message || '').includes('billingInfo')) {
        setError('Please complete your billing name and email before continuing.');
      } else {
        setError(requestError.message || 'Could not create checkout order.');
      }
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <div className="bg-white text-slate-950">
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.09),transparent_32%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-blue-600" />
                Pricing
              </div>
              <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-5xl md:text-6xl">
                {hasActiveMembership ? 'Membership Active And Ready.' : 'Simple Pricing. Trusted Platform.'}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                {hasActiveMembership
                  ? 'Your annual membership is already active. Pricing is locked and no duplicate payment is needed.'
                  : (
                    <>
                      One annual membership, secure billing under{' '}
                      <a
                        href="https://www.8techburp.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-black text-slate-950 underline decoration-slate-950 decoration-2 underline-offset-4 transition-colors hover:text-slate-700"
                      >
                        8TechBurp
                      </a>
                      , no commission, no lead charges, and no hidden costs.
                    </>
                  )}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {(hasActiveMembership
                  ? [
                      ['Membership active', 'Your annual access is already enabled'],
                      ['No duplicate payment', 'This page now stops repeat purchase confusion'],
                      ['Annual access', 'Your membership remains active for the plan period'],
                      ['Pricing locked', 'No extra checkout action is needed']
                    ]
                  : [
                      ['No commission', 'Keep direct deal value'],
                      ['No lead charges', 'Connect without buying leads'],
                      ['Coupon ready', 'Backend validated discounts'],
                      ['Razorpay ready', 'Order and transaction records']
                    ]
                ).map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <div className="mt-3 text-sm font-black text-slate-900">{title}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] md:p-8">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${hasActiveMembership ? 'bg-emerald-600' : 'bg-slate-900'}`}>
                  {hasActiveMembership ? <ShieldCheck className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    {hasActiveMembership ? 'Membership Active' : 'Membership Checkout'}
                  </div>
                  <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950">
                    {hasActiveMembership ? 'Your plan is already active.' : 'Select plan and apply coupon.'}
                  </h2>
                </div>
              </div>

              {loading ? (
                <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading live plans...
                </div>
              ) : hasActiveMembership ? (
                <>
                  <div className="mt-7 rounded-[1.6rem] border border-emerald-100 bg-emerald-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">Membership confirmed</div>
                        <h3 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">Annual plan is active.</h3>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                          Your account already has an active membership, so there is nothing else to purchase here.
                        </p>
                      </div>
                      <div className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-700">
                        Active
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Account type</div>
                        <div className="mt-2 text-lg font-black text-slate-950 capitalize">{member?.account_type || 'Member'}</div>
                      </div>
                      <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                          <CalendarDays className="h-4 w-4" />
                          Started
                        </div>
                        <div className="mt-2 text-lg font-black text-slate-950">{formatDate(member?.subscription_started_at)}</div>
                      </div>
                      <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                          <CalendarDays className="h-4 w-4" />
                          Valid till
                        </div>
                        <div className="mt-2 text-lg font-black text-slate-950">{formatDate(member?.subscription_expires_at)}</div>
                      </div>
                    </div>
                  </div>

                </>
              ) : (
                <>
                  <div className="mt-7 grid gap-4">
                    {plans.map((plan) => {
                      const isCreator = plan.account_type === 'creator';
                      const selected = selectedPlanId === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`rounded-[1.4rem] border p-5 text-left transition-all ${
                            selected
                              ? isCreator ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${isCreator ? 'bg-blue-600' : 'bg-orange-500'}`}>
                                {isCreator ? <UserRound className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                              </div>
                              <div>
                                <div className="text-lg font-black text-slate-900">{plan.name}</div>
                                <p className="mt-1 text-sm leading-6 text-slate-500">{plan.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black text-slate-950">{formatCurrency(plan.amount_inr)}</div>
                              <div className="text-xs font-bold text-slate-400">{plan.duration_days} days</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                   <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[
                      ['fullName', 'Billing name *'],
                      ['email', 'Billing email *'],
                      ['phone', 'Phone *'],
                      ['gstNumber', 'GST number (Optional)']
                    ].map(([key, label]) => (
                      <label key={key} className="grid gap-2">
                        <span className="text-sm font-bold text-slate-700">
                          {label.endsWith('*') ? (
                            <>
                              {label.slice(0, -2)}{' '}
                              <span className="text-rose-500 font-black">*</span>
                            </>
                          ) : (
                            label
                          )}
                        </span>
                        <input
                          value={billingInfo[key]}
                          onChange={(event) => setBillingInfo((current) => ({ ...current, [key]: event.target.value }))}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-slate-400"
                        />
                      </label>
                    ))}
                  </div>

                  <label className="mt-4 grid gap-2">
                    <span className="text-sm font-bold text-slate-700">
                      Billing address <span className="text-rose-500 font-black">*</span>
                    </span>
                    <textarea
                      value={billingInfo.address}
                      onChange={(event) => setBillingInfo((current) => ({ ...current, address: event.target.value }))}
                      rows={3}
                      className="resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-slate-400"
                    />

                  </label>

                  <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative flex-1">
                        <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={couponCode}
                          onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                          placeholder="WELCOME10"
                          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-black text-slate-800 outline-none focus:border-slate-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={checkingCoupon || !selectedPlanId}
                        className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-700 disabled:opacity-60"
                      >
                        {checkingCoupon ? 'Checking...' : 'Apply Coupon'}
                      </button>
                    </div>
                  </div>

                  {error && <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</div>}
                  {message && <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>}

                  <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <div className="flex justify-between text-sm font-bold text-slate-500">
                      <span>Base amount</span>
                      <span>{formatCurrency(selectedPlan?.amount_inr || 0)}</span>
                    </div>
                    <div className="mt-3 flex justify-between text-sm font-bold text-emerald-600">
                      <span>Discount</span>
                      <span>- {formatCurrency(discount)}</span>
                    </div>
                    <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
                      <span className="text-lg font-black text-slate-900">Final price</span>
                      <span className="text-3xl font-black text-slate-950">{formatCurrency(finalAmount)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={createCheckout}
                    disabled={creatingOrder || !selectedPlanId}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] hover:bg-blue-700 disabled:opacity-60"
                  >
                    {creatingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {isFullDiscountCoupon ? 'Activate Membership' : 'Proceed to Payment'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-[#fbfbfd] py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Sparkles className="mx-auto h-6 w-6 text-blue-600" />
            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-950">
              {hasActiveMembership ? 'Your membership is live and ready.' : 'One Membership. One Price. Direct Connections.'}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              {hasActiveMembership
                ? 'You can now publish, connect, and use the platform without returning to the checkout flow.'
                : 'Rs 999/Year · No Commission · No Lead Charges · No Success Fees'}
            </p>
            {hasActiveMembership ? (
              <button
                type="button"
                onClick={() => navigate('/post-verse')}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-black text-white"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link to="/signup" className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-black text-white">
                Create account first
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Payment;
