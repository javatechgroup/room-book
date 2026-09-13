import React, { useState, useEffect } from 'react';
import {
  Building2,
  CalendarCheck,
  Users,
  Shield,
  Clock,
  Bell,
  ChevronRight,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Star,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';
import './App.css';

/* ───────────────────────── Header ───────────────────────── */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">
        <a href="#" className="header__logo">
          <LayoutGrid size={28} className="header__logo-icon" />
          <span className="header__logo-text">MeetSpace</span>
        </a>

        <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="header__link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href="#contact" className="btn btn--primary btn--sm" onClick={() => setMobileOpen(false)}>
            Get Started
          </a>
        </nav>

        <button
          className="header__toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

/* ───────────────────────── Hero ──────────────────────────── */
function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" />
      <div className="container hero__content">
        <div className="hero__badge">
          <Star size={14} />
          <span>Trusted by 500+ Organizations</span>
        </div>
        <h1 className="hero__title">
          Book Meeting Rooms <br />
          <span className="hero__title--accent">In Seconds, Not Minutes</span>
        </h1>
        <p className="hero__subtitle">
          Stop the back-and-forth emails. Find available meeting rooms, reserve them
          instantly, invite participants, and get automatic reminders — all from one dashboard.
        </p>
        <div className="hero__actions">
          <a href="#contact" className="btn btn--primary btn--lg">
            Start Free Trial <ArrowRight size={18} />
          </a>
          <a href="#features" className="btn btn--outline btn--lg">
            Explore Features
          </a>
        </div>
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-value">10K+</span>
            <span className="hero__stat-label">Meetings Booked Daily</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">500+</span>
            <span className="hero__stat-label">Organizations</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">99.9%</span>
            <span className="hero__stat-label">Uptime</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Features ─────────────────────── */
const features = [
  {
    icon: CalendarCheck,
    title: 'Instant Room Booking',
    description:
      'See which meeting rooms are free right now. Reserve a conference room in one click — no double-bookings, ever.',
    color: '#3b82f6',
  },
  {
    icon: Building2,
    title: 'Multi-Company Ready',
    description:
      'Perfect for co-working spaces or enterprises with multiple offices. Each organization gets its own isolated workspace.',
    color: '#8b5cf6',
  },
  {
    icon: Users,
    title: 'Invite Participants',
    description:
      'Add colleagues to your meeting invite. Everyone gets notified with room details, time, and agenda automatically.',
    color: '#10b981',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Admins manage rooms and policies. Employees book and view availability. Every action secured with JWT authentication.',
    color: '#f59e0b',
  },
  {
    icon: Clock,
    title: 'Custom Booking Policies',
    description:
      'Set max meeting duration, advance booking limits, and cancellation windows to match how your organization works.',
    color: '#ef4444',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Automatic email alerts when meetings are booked, rescheduled, or cancelled. No one misses a meeting again.',
    color: '#06b6d4',
  },
];

function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2 className="section-title">Everything You Need to Manage Meeting Rooms</h2>
          <p className="section-subtitle">
            End scheduling chaos. One platform to find, book, and manage every conference room across your organization.
          </p>
        </div>
        <div className="features__grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div
                className="feature-card__icon"
                style={{ backgroundColor: `${f.color}15`, color: f.color }}
              >
                <f.icon size={24} />
              </div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── How It Works ─────────────────────── */
const steps = [
  {
    number: '01',
    title: 'Subscribe & Onboard',
    description: 'Contact us to set up your organization. We\'ll create your workspace and admin account in minutes.',
  },
  {
    number: '02',
    title: 'Configure Your Rooms',
    description: 'Add your conference rooms, board rooms, and huddle spaces with capacity, floor, and amenity details.',
  },
  {
    number: '03',
    title: 'Invite Your Team',
    description: 'Add departments and employees. Everyone gets access to search rooms and book meetings instantly.',
  },
  {
    number: '04',
    title: 'Book Meetings',
    description: 'Search for available rooms, pick a time slot, invite participants, and confirm — all in a few clicks.',
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">Get Started in 4 Simple Steps</h2>
          <p className="section-subtitle">
            From sign-up to your first meeting room booking — it takes less than 10 minutes.
          </p>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step" key={s.number}>
              <div className="step__number">{s.number}</div>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__desc">{s.description}</p>
              {i < steps.length - 1 && <ChevronRight className="step__arrow" size={24} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── Pricing ──────────────────────────── */
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

/* ───────────────────── Contact Form ─────────────────────── */
function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: integrate with backend API
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    }, 4000);
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact__wrapper">
          {/* Left – Info */}
          <div className="contact__info">
            <span className="section-tag section-tag--light">Contact Us</span>
            <h2 className="contact__title">
              Ready to Simplify Your Meeting Room Scheduling?
            </h2>
            <p className="contact__subtitle">
              Get in touch to subscribe, schedule a demo, or ask any questions.
              Our team will respond within 24 hours.
            </p>
            <div className="contact__details">
              <div className="contact__detail">
                <Mail size={20} />
                <div>
                  <span className="contact__detail-label">Email</span>
                  <span className="contact__detail-value">hello@meetspace.io</span>
                </div>
              </div>
              <div className="contact__detail">
                <Phone size={20} />
                <div>
                  <span className="contact__detail-label">Phone</span>
                  <span className="contact__detail-value">+1 (555) 123-4567</span>
                </div>
              </div>
              <div className="contact__detail">
                <MapPin size={20} />
                <div>
                  <span className="contact__detail-label">Office</span>
                  <span className="contact__detail-value">123 Business Ave, Suite 200</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right – Form */}
          <form className="contact__form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="contact__success">
                <CheckCircle size={48} />
                <h3>Thank You!</h3>
                <p>We've received your inquiry. Our team will reach out to you shortly.</p>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Work Email *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company">Company Name *</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Acme Corp"
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="Tell us about your requirements..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn--primary btn--full">
                  <Send size={18} />
                  Send Message
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Footer ────────────────────────── */
function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: ['Features', 'Pricing', 'Integrations', 'Changelog'],
    Company: ['About Us', 'Careers', 'Blog', 'Press'],
    Resources: ['Documentation', 'Help Center', 'API Reference', 'Status'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#" className="footer__logo">
              <LayoutGrid size={24} />
              <span>MeetSpace</span>
            </a>
            <p className="footer__tagline">
              The smart way to manage meeting rooms. Book conference rooms, invite participants, and keep your team organized.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Twitter">𝕏</a>
              <a href="#" className="footer__social-link" aria-label="LinkedIn">in</a>
              <a href="#" className="footer__social-link" aria-label="GitHub">GH</a>
            </div>
          </div>
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div className="footer__column" key={heading}>
              <h4 className="footer__heading">{heading}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer__bottom">
          <p>&copy; {currentYear} MeetSpace. All rights reserved.</p>
          <p>
            Made with ❤️ for productive meetings
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────── App ───────────────────────────── */
function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
