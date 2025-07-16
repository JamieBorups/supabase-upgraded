
import React from 'react';
import InfoBox from '../user-guide/InfoBox';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <div className="user-guide-content max-w-4xl mx-auto">
        <h2>About The Arts Incubator</h2>
        <p>
          The Arts Incubator is a mission-driven digital workspace designed to empower artists and arts collectives by simplifying administration and fostering creative development. It is a comprehensive, all-in-one platform for managing projects from the initial spark of an idea all the way to the final report.
        </p>

        <h3>Philosophy & Origins</h3>
        <p>
          Born from the needs of northern and independent artists, this platform was prototyped by reverse-engineering core elements of major public arts funding systems. Our goal is to demystify the grant application process by creating a workspace that mirrors the logic and requirements of funders, helping artists build capacity and confidence.
        </p>
        <p>
          The platform's design is guided by a commitment to data sovereignty and accessibility. Recognizing the challenges of inconsistent connectivity, we prioritize radical data portability through a comprehensive Import/Export system. This ensures you always own your data and can work offline when needed, making it a tool built for your environment, on your terms.
        </p>

        <InfoBox type="info">
          <h4>A Tool for Building Capacity</h4>
          <p>This platform was built to address the systemic challenges faced by artists who often perform the triple duty of artist, administrator, and bookkeeper. We aim to reduce administrative load through:</p>
          <ul>
            <li><strong>Integrated Strategic Frameworks:</strong> Tools like the ECO-STAR and SDG Alignment reports are embedded workshops that teach the language of funders.</li>
            <li><strong>The AI Co-Pilot:</strong> An on-demand assistant for grant writing, brainstorming, and strategic analysis, acting as a virtual support team.</li>
            <li><strong>Financial Literacy through Practice:</strong> The budget and marketplace modules are hands-on simulators for building financial skills in a low-risk environment.</li>
          </ul>
        </InfoBox>

        <h3>Core Features</h3>
        <p>The application integrates several key workflows into one cohesive system:</p>
        <ul>
            <li><strong>Project Management:</strong> Manage your entire project lifecycle, from drafting proposals with AI assistance to tracking tasks and generating final reports.</li>
            <li><strong>Dynamic Budgeting:</strong> Create detailed project budgets and see them update in real-time as you log activities, giving you a live "budget vs. actuals" view.</li>
            <li><strong>Event & Venue Management:</strong> Organize performances, workshops, and fundraisers with a dedicated module for managing venues, schedules, and ticket sales.</li>
            <li><strong>Marketplace & POS:</strong> A built-in business simulator to manage inventory, run a point-of-sale for events, and analyze profitability.</li>
            <li><strong>CRM & Communications:</strong> Maintain a database of external contacts (media, funders, partners) and generate professional news releases with AI support.</li>
        </ul>
        
        <h3>Acknowledgements</h3>
        <p>
          This work was made possible through visionary support and foundational research from our partners, including the <strong>Canada Council for the Arts Digital Greenhouse</strong> and the <strong>OpenAI Researcher Access Program</strong>. We also extend our deepest gratitude to the many northern and Indigenous artists whose insights have been instrumental in shaping this platform.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
