import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, PLANS } from '@/lib/razorpay';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      userId,
    } = body;

    // Verify payment signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];
    const supabase = await createAdminClient();

    const now = new Date();
    const periodEnd = new Date(now);
    plan === 'monthly'
      ? periodEnd.setMonth(periodEnd.getMonth() + 1)
      : periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    const { error } = await supabase.from('subscriptions').upsert(
      {
        user_id: userId,
        plan,
        status: 'active',
        razorpay_subscription_id: razorpay_payment_id,
        razorpay_customer_id: razorpay_order_id,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        amount_paise: planConfig.amount_paise,
        charity_percentage: 10,
      },
      { onConflict: 'user_id' }
    );

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
