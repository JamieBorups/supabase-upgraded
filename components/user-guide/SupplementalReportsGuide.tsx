
import React from 'react';
import InfoBox from './InfoBox';

const SupplementalReportsGuide: React.FC = () => {
  return (
    <div>
      <h2>Supplemental Reports</h2>
      <p>
        Beyond standard final reporting, this application includes a powerful suite of tools to generate <strong>AI-powered supplemental reports</strong>. These are strategic documents designed to help you with fundraising, partnership development, and articulating the deeper impact of your work.
      </p>
      <p>
        You can generate these reports from the <code>Tools</code> menu and find all your saved reports in the <code>Projects {'>'} Reporting & Archives {'>'} Supplemental Reports</code> tab.
      </p>
      <InfoBox type="info">
        <p>This page provides a high-level overview. For a detailed guide on each specific report and how to use it, please see the dedicated pages in the user guide menu:</p>
         <ul>
            <li>ECO-STAR</li>
            <li>SDG Alignment</li>
            <li>Framework for Recreation (Canada)</li>
            <li>Interest Compatibility</li>
          </ul>
      </InfoBox>
      
      <h3>What Are They For?</h3>
      <p>Each tool is designed to analyze your project data through a different strategic lens, helping you communicate its value to different audiences:</p>
      <ul>
        <li>
          <strong>ECO-STAR AI Workshop:</strong> Frames your project using a business and sustainability model. Excellent for social enterprise grants or partners interested in community and environmental impact.
        </li>
        <li>
          <strong>SDG Alignment Report:</strong> Positions your project within a global context by aligning it with the UN Sustainable Development Goals. Invaluable for large foundations, corporate sponsors, and federal grants.
        </li>
        <li>
          <strong>Framework for Recreation in Canada Alignment Report:</strong> Translates your arts project into the language of recreation and wellness. This is key for unlocking funding from municipal, health, and community-focused bodies.
        </li>
        <li>
          <strong>Interest Compatibility Assessment:</strong> Acts as a strategic planning tool for your team. It analyzes the stated and unstated interests of all stakeholders to identify potential synergies and conflicts before they arise.
        </li>
      </ul>
      <p>By using these tools, you can create a portfolio of documents that showcase the multi-faceted value of your artistic work, making your projects more competitive and resilient.</p>
    </div>
  );
};

export default SupplementalReportsGuide;
