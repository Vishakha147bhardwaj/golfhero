import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, PLANS } from '@/lib/razorpay';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);
  const supabase = await createAdminClient();

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const { userId, plan } = payment.notes ?? {};
    if (userId && plan) {
      const now = new Date();
      const periodEnd = new Date(now);
      plan === 'monthly'
        ? periodEnd.setMonth(periodEnd.getMonth() + 1)
        : periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      const planConfig = PLANS[plan as keyof typeof PLANS];
      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          plan,
          status: 'active',
          razorpay_subscription_id: payment.id,
          razorpay_customer_id: payment.order_id,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          amount_paise: planConfig?.amount_paise ?? 199900,
          charity_percentage: 10,
        },
        { onConflict: 'user_id' }
      );
    }
  }

  if (event.event === 'subscription.cancelled') {
    const sub = event.payload.subscription.entity;
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('razorpay_subscription_id', sub.id);
  }

  return NextResponse.json({ received: true });
}
