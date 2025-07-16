
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
          <strong>ECO-STAR AI Workshop:</strong> Frames your project using a business and sustainability model. <strong>Best for:</strong> Social enterprise grants, community economic development funders, or partners interested in environmental impact.
        </li>
        <li>
          <strong>SDG Alignment Report:</strong> Positions your project within a global context by aligning it with the UN Sustainable Development Goals. <strong>Best for:</strong> Large national/international foundations, corporate sponsors with CSR mandates, and federal government grants.
        </li>
        <li>
          <strong>Framework for Recreation in Canada Alignment Report:</strong> Translates your arts project into the language of community recreation and wellness. <strong>Best for:</strong> Municipal grants, provincial "Healthy Communities" funding streams, and partners in the health and wellness sector.
        </li>
        <li>
          <strong>Interest Compatibility Assessment:</strong> Acts as an internal strategic planning tool for your team. It helps you anticipate and manage stakeholder relationships, making it a valuable document for board meetings, project kick-offs, and partnership negotiations.
        </li>
      </ul>
      <p>By using these tools, you can create a portfolio of documents that showcase the multi-faceted value of your artistic work, making your projects more competitive and resilient.</p>
    </div>
  );
};

export default SupplementalReportsGuide;
