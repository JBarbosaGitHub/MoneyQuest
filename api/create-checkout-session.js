async function getSumUpToken() {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.SUMUP_CLIENT_ID,
    client_secret: process.env.SUMUP_CLIENT_SECRET,
  });

  const res = await fetch('https://api.sumup.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to get token');
  return data.access_token;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, amount, currency, description, successUrl, buyerEmail } = req.body || {};

    if (!productId || !amount || !currency || !description || !buyerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const token = await getSumUpToken();
    const reference = `pay-${productId}-${Date.now()}`;

    const checkoutRes = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        checkout_reference: reference,
        amount: Number(amount).toFixed(2),
        currency,
        merchant_code: process.env.SUMUP_MERCHANT_CODE,
        description,
        return_url: process.env.SUMUP_WEBHOOK_URL || successUrl,
        hosted_checkout: { enabled: true },
      }),
    });

    const data = await checkoutRes.json();
    if (!checkoutRes.ok) {
      console.error('SumUp error:', data);
      throw new Error(data.message || 'Checkout failed');
    }

    res.json({ id: data.id, hosted_checkout_url: data.hosted_checkout_url });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};