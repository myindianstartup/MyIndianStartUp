import React from 'react';
import DocPageShell from '@/components/site/DocPageShell';

const SearchVerse = () => (
  <DocPageShell
    accent="emerald"
    eyebrow="Discovery Engine"
    title="SearchVerse helps users find the right businesses and creators."
    description="The docs describe search as a core module for discovering businesses, creators, freelancers, and professionals across India."
    primaryAction={{ to: '/join', label: 'Create a profile first' }}
    secondaryAction={{ to: '/platform', label: 'See ecosystem structure' }}
    stats={[
      { value: 'PAN', label: 'India coverage' },
      { value: '2', label: 'Search targets' },
      { value: '1', label: 'Login prompt' }
    ]}
    previewTitle="Search scope"
    previewDescription="SearchVerse covers discovery for businesses and creators, and the docs note a login or registration prompt if users try to search without access."
    previewItems={[
      'Search businesses',
      'Search creators',
      'Prompt unauthenticated users to join'
    ]}
    featureTitle="SearchVerse features"
    featureDescription="The search experience sits at the center of discovery and matching."
    features={[
      { title: 'Business discovery', copy: 'Find companies, products, and service providers across India.' },
      { title: 'Creator discovery', copy: 'Find creators, influencers, freelancers, and specialists.' },
      { title: 'Login gate', copy: 'If users search without login or registration, the docs say a popup should appear.' },
      { title: 'Filterable results', copy: 'The search module should support category-level discovery and matching.' },
      { title: 'Direct collaboration', copy: 'Search results should lead into direct conversations, not intermediary lead sales.' },
      { title: 'Cross-category support', copy: 'The docs place discovery across both business and creator workflows.' }
    ]}
    footerNote="SearchVerse is the discovery layer that connects the platform's profile, feed, and direct collaboration flows."
  />
);

export default SearchVerse;