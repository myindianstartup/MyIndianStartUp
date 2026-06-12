import React from 'react';
import DocPageShell from '@/components/site/DocPageShell';

const ProfileVerse = () => (
  <DocPageShell
    accent="blue"
    eyebrow="ProfileVerse"
    title="ProfileVerse is the identity layer for businesses and creators."
    description="The docs show separate business and creator profile experiences with fields for identity, social links, and credibility details."
    primaryAction={{ to: '/business-verse', label: 'Business profile' }}
    secondaryAction={{ to: '/creator-verse', label: 'Creator profile' }}
    stats={[
      { value: '2', label: 'Profile types' },
      { value: '9+', label: 'Creator fields' },
      { value: '8+', label: 'Business fields' }
    ]}
    previewTitle="Profile preview"
    previewDescription="The docs ask for sample profile cards that show how identity, work, and contact details are presented."
    previewItems={[
      'Business name, industry, city, website, social links',
      'Creator name, skills, portfolio, social links',
      'Daily posts and contact information'
    ]}
    featureTitle="What profiles should include"
    featureDescription="Both profile types are meant to make a member credible and discoverable at a glance."
    features={[
      { title: 'Business profile fields', copy: 'Logo, business name, industry, city and state, website, social media, about company, and contact details.' },
      { title: 'Creator profile fields', copy: 'Profile photo, full name, skills, about me, portfolio links, social links, city and state, contact info, and daily posts.' },
      { title: 'Professional identity', copy: 'Profiles are the public identity layer for discovery and collaboration.' },
      { title: 'Portfolio visibility', copy: 'Creator profiles are meant to showcase work and make talent discoverable.' },
      { title: 'Business trust', copy: 'Business profiles help members evaluate a company before reaching out.' },
      { title: 'Sample cards', copy: 'The docs explicitly request preview cards for both business and creator profiles.' }
    ]}
    footerNote="ProfileVerse is the public identity system described throughout the DOCX, tying together discovery and collaboration."
  />
);

export default ProfileVerse;