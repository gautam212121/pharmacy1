import React from 'react';
import Footer from './component/footer';
import Home from './home/page'; // Corrected import path

// import {
//   ClerkProvider,
//   SignInButton,
//   SignUpButton,
//   SignedIn,
//   SignedOut,
//   UserButton,
// }
  // from '@clerk/nextjs' // This is a Server Component by default
export default function AboutPage() {
  return (
    <div>
      <Home />
      <Footer />
    </div>);
}