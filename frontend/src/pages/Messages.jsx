import React from 'react';
import DocPageShell from '@/components/site/DocPageShell';

const Messages = () => (
  <DocPageShell
    accent="orange"
    eyebrow="Direct Messaging"
    title="Messages keeps businesses and creators connected directly."
    description="The docs emphasize direct business-to-creator connections without middlemen, which makes messaging a core platform module."
    primaryAction={{ to: '/join', label: 'Start connecting' }}
    secondaryAction={{ to: '/platform', label: 'View the ecosystem' }}
    stats={[
      { value: 'Direct', label: 'Communication' },
      { value: '0', label: 'Middlemen' },
      { value: '100%', label: 'Agreed value kept' }
    ]}
    previewTitle="Message use cases"
    previewDescription="The messaging layer supports discovery-to-deal workflows across business and creator profiles."
    previewItems={[
      'Creator sponsorship conversations',
      'Business collaboration outreach',
      'Platform-level direct communication'
    ]}
    featureTitle="What messaging should support"
    featureDescription="The docs focus on direct collaboration rather than lead marketplaces."
    features={[
      { title: 'Direct outreach', copy: 'Businesses and creators should be able to reach out without intermediary commission layers.' },
      { title: 'Collaboration flow', copy: 'Messaging should support partnership discussions, briefs, and delivery details.' },
      { title: 'No middlemen', copy: 'The docs repeatedly say the platform is built for direct deals.' },
      { title: 'Cross-roles', copy: 'Messages should connect businesses, creators, freelancers, and professionals.' },
      { title: 'Simple follow-up', copy: 'After discovery, messaging turns interest into an actual collaboration.' },
      { title: 'Trust-building', copy: 'Direct conversations make the platform feel more personal and transparent.' }
    ]}
    footerNote="The docs describe direct collaboration as a core differentiator, so messaging is part of the main platform experience."
  />
);

export default Messages;