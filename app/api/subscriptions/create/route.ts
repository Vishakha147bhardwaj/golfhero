import { NextRequest, NextResponse } from 'next/server';
import { PLANS } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email, name } = await req.json();

    if (!plan || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      );
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];

    if (!planConfig) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    /* ✅ Lazy load Razorpay (fixes Vercel build crash) */
    const Razorpay = (await import('razorpay')).default;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys not configured');
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: planConfig.amount_paise,
      currency: 'INR',
      receipt: `sub_${userId.slice(0, 8)}_${Date.now()}`,
      notes: { userId, plan, email, name },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: planConfig.amount_paise,
      keyId: process.env.RAZORPAY_KEY_ID,
      currency: 'INR',
    });

  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Internal Server Error';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}