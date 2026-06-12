import React from 'react';
import DocPageShell from '@/components/site/DocPageShell';

const Payment = () => (
  <DocPageShell
    accent="slate"
    eyebrow="Pricing"
    title="Simple Pricing. Trusted Platform."
    description="MyIndianStartup is a SaaS platform owned, operated, and managed by 8TechBurp. The annual membership fee is Rs 999 per year with no commission, no lead purchase fees, no success fees, and no hidden costs."
    primaryAction={{ to: '/signup', label: 'Join Now' }}
    secondaryAction={{ to: '/contact', label: 'Need help?' }}
    stats={[
      { value: 'Rs 999', label: 'Annual fee' },
      { value: '0', label: 'Commission' },
      { value: '0', label: 'Lead fees' }
    ]}
    previewTitle="One membership. One price."
    previewDescription="Direct connections across India for businesses, creators, freelancers, and professionals."
    previewItems={[
      'BusinessVerse or CreatorVerse access',
      'Daily image or video posting',
      'Direct connections across India',
      'Secure payment to 8TechBurp'
    ]}
    featureTitle="Transparent platform billing"
    featureDescription="All platform development, design, maintenance, operations, and intellectual property rights are managed by 8TechBurp."
    features={[
      { title: 'Platform owner', copy: 'MyIndianStartup is a SaaS platform owned, operated, and managed by 8TechBurp.' },
      { title: 'Annual membership', copy: 'The membership fee is Rs 999 per year for platform access, visibility, discovery, and direct collaboration.' },
      { title: 'No commission', copy: 'There are no commission charges, no success fees, and no revenue sharing on your direct deals.' },
      { title: 'No lead purchase fees', copy: 'Members do not need to buy leads or pay extra to connect with businesses or creators.' },
      { title: 'No hidden costs', copy: 'One membership. One price. No hidden costs, middlemen, or surprise platform charges.' },
      { title: 'Secure processing', copy: 'All membership payments are securely processed under the 8TechBurp business account.' }
    ]}
    footerNote="By purchasing a membership, you are making payment to 8TechBurp, the legal owner and operator of MyIndianStartup."
  />
);

export default Payment;
