import React from 'react';
import DocPageShell from '@/components/site/DocPageShell';

const JoinUs = () => (
  <DocPageShell
    accent="blue"
    eyebrow="Contact Us"
    title="Let's Connect"
    description="MyIndianStartup is proudly developed, designed, maintained, and operated by 8TechBurp. For membership support, technical assistance, partnership inquiries, business collaborations, or general questions, our team is here to help."
    primaryAction={{ to: '/signup', label: 'Create account' }}
    secondaryAction={{ to: '/login', label: 'Login' }}
    stats={[
      { value: '8TechBurp', label: 'Owner' },
      { value: '+91', label: 'India support' },
      { value: 'MIS', label: 'Platform' }
    ]}
    previewTitle="Platform owner & technology partner"
    previewDescription="8TechBurp manages the platform technology, operations, support, and business collaboration inquiries for MyIndianStartup."
    previewItems={[
      'contact@8techburp.com | Platform email',
      '+91 90236 15266',
      '8TechBurp - MIS website'
    ]}
    featureTitle="How we can help"
    featureDescription="Reach out for support, platform questions, partnerships, and collaboration opportunities."
    features={[
      { title: 'Membership support', copy: 'Questions about BusinessVerse, CreatorVerse, annual membership, account access, or activation.' },
      { title: 'Technical assistance', copy: 'Help with login, registration, profile setup, daily posts, or platform usage.' },
      { title: 'Partnership inquiries', copy: 'Connect with the team for strategic partnerships, ecosystem opportunities, and platform collaborations.' },
      { title: 'Business collaborations', copy: 'Discuss opportunities for businesses and creators to connect, collaborate, and grow across India.' },
      { title: 'General questions', copy: 'Ask about platform operations, ownership, pricing, support, or how MyIndianStartup works.' },
      { title: 'Technology partner', copy: '8TechBurp builds technology that helps businesses and creators connect, collaborate, and grow across India.' }
    ]}
    footerNote="Platform Owner & Technology Partner: 8TechBurp. Contact: contact@8techburp.com | +91 90236 15266."
  />
);

export default JoinUs;
