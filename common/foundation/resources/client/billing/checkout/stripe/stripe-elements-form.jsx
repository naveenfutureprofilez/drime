import clsx from 'clsx';
import { Button } from '@ui/buttons/button';
import { Fragment, useState } from 'react';
import { useStripe } from '@common/billing/checkout/stripe/use-stripe';
import { Skeleton } from '@ui/skeleton/skeleton';
export function StripeElementsForm({
  productId,
  priceId,
  type = 'subscription',
  submitLabel,
  returnUrl
}) {
  const {
    stripe,
    elements,
    paymentElementRef,
    stripeIsEnabled
  } = useStripe({
    type,
    productId,
    priceId
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // disable upgrade button if stripe is enabled, but not loaded yet
  const stripeIsReady = !stripeIsEnabled || elements != null && stripe != null;
  const handleSubmit = async e => {
    e.preventDefault();

    // stripe has not loaded yet
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    try {
      const method = type === 'subscription' ? 'confirmPayment' : 'confirmSetup';
      const result = await stripe[method]({
        elements,
        confirmParams: {
          return_url: returnUrl
        }
      });

      // don't show validation error as it will be shown already by stripe payment element
      if (result.error?.type !== 'validation_error' && result.error?.message) {
        setErrorMessage(result.error.message);
      }
    } catch {}
    setIsSubmitting(false);
  };
  return <form onSubmit={handleSubmit}>
      <div ref={paymentElementRef} className={clsx('min-h-[303px]', !stripeIsEnabled && 'hidden')}>
        {stripeIsEnabled && <StripeSkeleton />}
      </div>
      {errorMessage && !isSubmitting && <div className="mt-20 text-danger">{errorMessage}</div>}
      <Button variant="flat" color="primary" size="md" className="mt-40 w-full" type="submit" disabled={isSubmitting || !stripeIsReady}>
        {submitLabel}
      </Button>
    </form>;
}
function StripeSkeleton() {
  return <Fragment>
      <Skeleton className="mb-20 h-30" />
      <Skeleton className="mb-20 h-30" />
      <Skeleton className="mb-20 h-30" />
      <Skeleton className="h-30" />
    </Fragment>;
}