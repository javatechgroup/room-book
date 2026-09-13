import React from 'react';
import { CheckCircle } from 'lucide-react';
import './Pricing.css';

const plans = [
  {
    name: 'Starter',
    price: '29',
    period: '/month',
    description: 'For small teams with a few meeting rooms',
    features: ['Up to 5 meeting rooms', '25 employees', 'Email notifications', 'Basic reporting'],
    highlighted: false,
  },
  {
    name: 'Business',
    price: '79',
    period: '/month',
    description: 'For growing offices with active scheduling',
    features: [
      'Up to 25 meeting rooms',
      '100 employees',
      'Custom booking policies',
      'Priority support',
      'Audit logging',
      'Calendar integrations',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For multi-office or multi-company deployments',
    features: [
      'Unlimited meeting rooms',
      'Unlimited employees',
      'Multi-company support',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Pricing</span>
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-subtitle">
            Choose the plan that fits your organization. No hidden fees.
          </p>
        </div>
        <div className="pricing__grid">
          {plans.map((plan) => (
            <div
              className={`pricing-card ${plan.highlighted ? 'pricing-card--highlighted' : ''}`}
              key={plan.name}
            >
              {plan.highlighted && <div className="pricing-card__badge">Most Popular</div>}
              <h3 className="pricing-card__name">{plan.name}</h3>
              <p className="pricing-card__desc">{plan.description}</p>
              <div className="pricing-card__price">
                {plan.price !== 'Custom' && <span className="pricing-card__currency">$</span>}
                <span className="pricing-card__amount">{plan.price}</span>
                {plan.period && <span className="pricing-card__period">{plan.period}</span>}
              </div>
              <ul className="pricing-card__features">
                {plan.features.map((feat) => (
                  <li key={feat}>
                    <CheckCircle size={16} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`btn btn--full ${plan.highlighted ? 'btn--primary' : 'btn--outline'}`}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
