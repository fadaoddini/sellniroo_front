// components/About/AboutPage.jsx
import React from 'react';
import { AboutProvider } from './AboutContext';
import About from './index';

// ============================================
// صفحه About با Provider
// ============================================
const AboutPage = () => {
  return (
    <AboutProvider initialLang="fa">
      <About 
        showStats={true}
        showAchievements={true}
        className="custom-about-section"
      />
    </AboutProvider>
  );
};

export default AboutPage;