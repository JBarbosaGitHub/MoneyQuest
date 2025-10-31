const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

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
  if (!res.ok) throw new Error('Failed to get SumUp token');
  return data.access_token;
}

module.exports = async (req, res) => {
  console.log('Webhook received:', req.method, req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event_type, id } = req.body || {};

    if (event_type !== 'CHECKOUT_STATUS_CHANGED') {
      return res.json({ message: 'Event ignored' });
    }

    const token = await getSumUpToken();
    const checkoutRes = await fetch(`https://api.sumup.com/v0.1/checkouts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const checkout = await checkoutRes.json();
    console.log('Checkout details:', checkout);

    if (checkout.status === 'PAID') {
      const purchaseData = {
        checkoutId: checkout.id,
        reference: checkout.checkout_reference,
        amount: checkout.amount,
        currency: checkout.currency,
        description: checkout.description,
        status: checkout.status,
        timestamp: new Date().toISOString(),
      };

      await db.collection('purchases').doc(checkout.id).set(purchaseData);
      console.log('Purchase saved:', purchaseData);
    }

    res.json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};