'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/* =========================
   Razorpay Types (NO any)
========================= */

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): RazorpayInstance;
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    email?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close?: () => void;
}

export default function SubscribePage() {
  const router = useRouter();

  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* =========================
     Load Razorpay SDK safely
  ========================= */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.Razorpay) return;

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) return;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* =========================
        Payment Handler
  ========================= */
  async function handleSubscribe() {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      /* Create order */
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user.id,
          email: user.email,
          name: user.user_metadata?.full_name ?? '',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.orderId) {
        throw new Error(data.error ?? 'Failed to create order');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      /* Razorpay options */
      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        name: 'GolfHero',
        description:
          plan === 'monthly'
            ? 'Monthly Subscription'
            : 'Yearly Subscription',
        order_id: data.orderId,

        prefill: {
          email: user.email ?? '',
          name: user.user_metadata?.full_name ?? '',
        },

        theme: {
          color: '#22c55e',
        },

        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch(
              '/api/subscriptions/verify',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...response,
                  plan,
                  userId: user.id,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              router.push('/dashboard?subscribed=true');
            } else {
              setError(
                'Payment verification failed. Contact support.'
              );
              setLoading(false);
            }
          } catch {
            setError('Verification failed. Please try again.');
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      /* Open Razorpay */
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong';

      setError(message);
      setLoading(false);
    }
  }

  /* =========================
            UI
  ========================= */
  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 32 }}>
        <h1
          className="font-display"
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#f0fdf4',
            marginBottom: 4,
          }}
        >
          Subscribe
        </h1>

        <p
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 15,
          }}
        >
          Choose your plan and start entering monthly draws.
        </p>
      </div>

      {/* Plans */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {(['monthly', 'yearly'] as const).map((p) => (
          <div
            key={p}
            onClick={() => setPlan(p)}
            className="card card-hover"
            style={{
              borderColor:
                plan === p
                  ? 'rgba(34,197,94,0.5)'
                  : 'rgba(34,197,94,0.12)',
              background:
                plan === p
                  ? 'rgba(34,197,94,0.08)'
                  : '',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {p === 'yearly' && (
              <div
                className="badge-gold"
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                }}
              >
                Save 16%
              </div>
            )}

            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 8,
                textTransform: 'capitalize',
              }}
            >
              {p}
            </div>

            <div
              className="font-display"
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: '#4ade80',
                marginBottom: 4,
              }}
            >
              {p === 'monthly' ? '₹1,999' : '₹19,999'}
            </div>

            <div
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              per {p === 'monthly' ? 'month' : 'year'}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Button */}
      <button
        className="btn-primary"
        onClick={handleSubscribe}
        disabled={loading}
        style={{ fontSize: 16, padding: '14px 32px' }}
      >
        {loading
          ? 'Opening payment...'
          : 'Continue to Payment →'}
      </button>

      <p
        style={{
          marginTop: 12,
          fontSize: 12,
          color: 'rgba(255,255,255,0.3)',
        }}
      >
        Secure payment via Razorpay · UPI, Cards, Net Banking
        accepted · Cancel anytime
      </p>
    </div>
  );
}