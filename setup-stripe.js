const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
async function setup() {
  const plans = [
    { name: 'Starter', monthly: 999, annual: 9588 },
    { name: 'Growth', monthly: 2499, annual: 23988 },
    { name: 'Pro', monthly: 4999, annual: 47988 },
  ];
  for (const plan of plans) {
    const product = await stripe.products.create({ name: 'SermonCraft Pro - ' + plan.name });
    const monthly = await stripe.prices.create({ product: product.id, unit_amount: plan.monthly, currency: 'usd', recurring: { interval: 'month' } });
    const annual = await stripe.prices.create({ product: product.id, unit_amount: plan.annual, currency: 'usd', recurring: { interval: 'year' } });
    console.log(plan.name + ' Monthly: ' + monthly.id);
    console.log(plan.name + ' Annual: ' + annual.id);
  }
}
setup().catch(console.error);
