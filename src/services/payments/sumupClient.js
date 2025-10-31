// Client-side helper to call our SumUp checkout session API

export async function createCheckoutSession(payload) {
  // In development, Vercel Dev serves APIs at the same origin
  // In production, also same origin (deployed together)
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || 'Failed to create checkout session';
    throw new Error(msg);
  }
  return data; // { id, hosted_checkout_url }
}
