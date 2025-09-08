// src/app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for the auth token in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    setIsLoggedIn(!!token);
  }, []);

  // Handler for the main CTA buttons
  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoggedIn) {
      e.preventDefault();
      router.push('/questionnaire');
    }
  };

  return (
    <Layout>
      <section className="w-full bg-gradient-to-br from-cyan-100 via-gray-50 to-teal-50 text-gray-800">
        <div className="max-w-7xl mx-auto py-24 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Track Your ESG Performance
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto opacity-90">
              Effortlessly collect, calculate, and visualize your Environmental, Social, and Governance metrics.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              {/* Conditional CTA Button */}
              <Link
                href={isLoggedIn ? "/questionnaire" : "/signup"}
                onClick={handleCtaClick}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-700 hover:bg-teal-800 md:py-4 md:text-lg md:px-10 transition-colors shadow-sm text-center"
              >
                {isLoggedIn ? "Go to Questionnaire" : "Get Started"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-800 sm:text-4xl">
            From Data to Decision, Instantly
          </h2>
          <p className="mt-6 text-xl text-gray-700">
            Our platform simplifies ESG reporting by turning your raw data into a clear narrative. Track everything from carbon emissions to employee diversity across multiple financial years. Watch as your inputs are transformed into real-time insights like Carbon Intensity and Diversity Ratios, all culminating in an interactive dashboard and audit-ready reports.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Simplify ESG Reporting</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our platform helps you stay compliant and make data-driven decisions.
            </p>
          </div>
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Real-time Calculations</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Instantly see derived metrics like Carbon Intensity and Diversity Ratio as you input data.
                    </p>
                  </div>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Visual Dashboards</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Understand trends and performance with interactive charts for your ESG data.
                    </p>
                  </div>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-md bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Secure Data Storage</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Your ESG responses are securely stored and accessible only to you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
              <span className="block">Ready to start tracking?</span>
              <span className="block text-teal-700">{isLoggedIn ? "Continue your journey." : "Join today."}</span>
            </h2>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              {/* Conditional CTA Button */}
              <Link
                href={isLoggedIn ? "/questionnaire" : "/signup"}
                onClick={handleCtaClick}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-700 hover:bg-teal-800 md:py-4 md:text-lg md:px-10 transition-colors shadow-sm text-center"
              >
                {isLoggedIn ? "Go to Questionnaire" : "Create Account"}
              </Link>
              {/* Conditional Secondary Button*/}
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="px-8 py-3 border border-teal-600 text-base font-medium rounded-md text-teal-700 bg-transparent hover:bg-teal-50 md:py-4 md:text-lg md:px-10 transition-colors shadow-sm text-center"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout >
  );
}