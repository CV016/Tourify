/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51PdyhqFhhqIGfufXOt0FWPtKsYEayk9lVg3l4A3K5gl5su0dvSCZtjgCW2QWZI0b17m5LoXOgPYErMnnxmtSEGkU00KWg3gAtf',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get Checkout session
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    console.log('hello');
    console.log(session);
    // const session = response.data.session;

    // 2) Redirect to checkout form
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error');
  }
};
