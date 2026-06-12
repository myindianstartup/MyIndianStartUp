import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '@/components/site/AuthShell';

const SignIn = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('myindianstartup_auth_mode', 'signin');
      window.localStorage.setItem('myindianstartup_auth_provider', 'gmail');
    }
    navigate('/post-verse');
  };

  return (
    <AuthShell
      accent="emerald"
      eyebrow="Sign In"
      title="Welcome back. Sign in with Gmail."
      description="A clean sign-in screen for returning businesses, creators, freelancers, and professionals."
      actionLabel="Sign in with Gmail"
      altActionLabel="Create new account"
      altActionTo="/signup"
      submitLabel="Sign in with Gmail"
      onSubmit={handleSubmit}
      formFields={[
        { label: 'Gmail address', placeholder: 'you@gmail.com', type: 'email' },
        { label: 'Password', placeholder: 'Enter your password', type: 'password' }
      ]}
      features={[
        { title: 'Fast return', copy: 'Members can jump back into the ecosystem without redoing their profile.' },
        { title: 'Platform continuity', copy: 'Preserve access to PostVerse, SearchVerse, ProfileVerse, and Messages.' },
        { title: 'Simple flow', copy: 'The page keeps the sign-in journey focused on Google-based access.' }
      ]}
      notes={[
        'A sign-in page is useful for returning users and repeated access.',
        'The page language is intentionally Gmail-first.',
        'It fits the existing business + creator collaboration design.'
      ]}
    />
  );
};

export default SignIn;
