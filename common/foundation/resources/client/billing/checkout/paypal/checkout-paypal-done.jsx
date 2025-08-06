import { CheckoutLayout } from '../checkout-layout';
import { useParams, useSearchParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { message } from '@ui/i18n/message';
import { CheckoutProductSummary } from '../checkout-product-summary';
import { BillingRedirectMessage } from '../../billing-redirect-message';
import { apiClient } from '@common/http/query-client';
export function CheckoutPaypalDone() {
  const {
    productId,
    priceId
  } = useParams();
  const [params] = useSearchParams();
  const alreadyStoredLocally = useRef(false);
  const [messageConfig, setMessageConfig] = useState();
  useEffect(() => {
    const subscriptionId = params.get('subscriptionId');
    const status = params.get('status');
    if (alreadyStoredLocally.current) {
      return;
    }
    if (subscriptionId && status === 'success') {
      storeSubscriptionDetailsLocally(subscriptionId).then(() => {
        setMessageConfig(getRedirectMessageConfig('success', productId, priceId));
        window.location.href = '/billing';
      });
    } else {
      setMessageConfig(getRedirectMessageConfig(status, productId, priceId));
    }
    alreadyStoredLocally.current = true;
  }, [priceId, productId, params]);
  return <CheckoutLayout>
      <BillingRedirectMessage config={messageConfig} />
      <CheckoutProductSummary showBillingLine={false} />
    </CheckoutLayout>;
}
function getRedirectMessageConfig(status, productId, priceId) {
  switch (status) {
    case 'success':
      return {
        message: message('Subscription successful!'),
        status: 'success',
        buttonLabel: message('Return to site'),
        link: '/billing'
      };
    default:
      return {
        message: message('Something went wrong. Please try again.'),
        status: 'error',
        buttonLabel: message('Go back'),
        link: errorLink(productId, priceId)
      };
  }
}
function errorLink(productId, priceId) {
  return productId && priceId ? `/checkout/${productId}/${priceId}` : '/';
}
function storeSubscriptionDetailsLocally(subscriptionId) {
  return apiClient.post('billing/paypal/store-subscription-details-locally', {
    paypal_subscription_id: subscriptionId
  });
}