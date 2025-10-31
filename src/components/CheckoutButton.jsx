import React from 'react';
import { createCheckoutSession } from '../services/payments/sumupClient';

/**
 * Props:
 * - productId: string
 * - amount: number
 * - currency: string (e.g., 'EUR')
 * - description: string
 * - buyerEmail: string
 * - successUrl: string
 * - cancelUrl?: string
 * - specialistName?: string
 * - specialistDate?: string
 * - specialistTime?: string
 * - onStart?: () => void
 * - onError?: (err: Error) => void
 * - onComplete?: () => void
 */
export default function CheckoutButton({
  children = 'Checkout',
  productId,
  amount,
  currency,
  description,
  buyerEmail,
  successUrl,
  cancelUrl,
  onStart,
  onError,
  onComplete,
  className = 'btn btn-primary',
  disabled,
}) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      onStart?.();

      const payload = {
        productId,
        amount,
        currency,
        description,
        successUrl,
        cancelUrl,
        buyerEmail,
      };

      const { hosted_checkout_url } = await createCheckoutSession(payload);
      if (hosted_checkout_url) {
        window.location.assign(hosted_checkout_url);
      } else {
        throw new Error('Hosted checkout URL not returned');
      }
    } catch (err) {
      console.error(err);
      onError?.(err);
      alert(err?.message || 'Falha ao iniciar pagamento');
    } finally {
      setLoading(false);
      onComplete?.();
    }
  };

  return (
    <button className={className} onClick={handleClick} disabled={disabled || loading}>
      {loading ? 'Processando…' : children}
    </button>
  );
}
