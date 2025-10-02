'use client';

import React from 'react';
import Footer from './Footer';

const FooterExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sample content to demonstrate scroll functionality */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          SmoothFlow Footer Example
        </h1>
        
        <div className="space-y-8">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Section {i + 1}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                This is sample content to demonstrate the footer functionality. 
                Scroll down to see the &quot;Back to Top&quot; button appear after 300px of scrolling.
                The footer includes all the requested features: RTL layout, Arabic text,
                social media icons, quick links, contact information, trust badge,
                payment methods, and smooth scroll functionality.
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default FooterExample;
