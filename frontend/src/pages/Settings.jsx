import React from 'react';
import DocPageShell from '@/components/site/DocPageShell';

const Settings = () => (
  <DocPageShell
    accent="slate"
    eyebrow="Account Settings"
    title="Settings manages the profile and platform experience."
    description="The DOCX places Settings inside the platform structure as part of the recurring dashboard flow."
    primaryAction={{ to: '/join', label: 'Edit your profile' }}
    secondaryAction={{ to: '/pricing', label: 'Review membership' }}
    stats={[
      { value: 'Profile', label: 'Controls' },
      { value: 'Privacy', label: 'Options' },
      { value: 'Billing', label: 'Access' }
    ]}
    previewTitle="Settings sections"
    previewDescription="The docs don't list a full settings matrix, but they do place it inside the platform structure."
    previewItems={[
      'Profile details',
      'Notifications and privacy',
      'Membership and billing'
    ]}
    featureTitle="Settings responsibilities"
    featureDescription="A settings area is implied by the full platform structure and by the need to manage accounts cleanly."
    features={[
      { title: 'Profile management', copy: 'Users should be able to update their business or creator identity.' },
      { title: 'Account preferences', copy: 'Notification and visibility preferences belong here.' },
      { title: 'Membership management', copy: 'Settings should expose the active annual membership and renewal state.' },
      { title: 'Security basics', copy: 'Account settings should support safe access and profile control.' },
      { title: 'Platform access', copy: 'The docs treat Settings as part of the dashboard ecosystem.' },
      { title: 'Future extensibility', copy: 'A clean settings module leaves room for later dashboard features.' }
    ]}
    footerNote="Settings is included in the document's final platform map, so it belongs in the website structure even if the docs do not spell out every control."
  />
);

export default Settings;