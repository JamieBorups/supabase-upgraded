import React from 'react';
import InfoBox from './InfoBox';

const InterestCompatibilityGuide: React.FC = () => {
  return (
    <div>
      <h2>Interest Compatibility Assessment</h2>
      <p>
        The <strong>Interest Compatibility Assessment</strong> is an advanced strategic analysis tool that acts as a "relationship check-up" for your project. It uses AI to analyze all the data related to a project and identify the stated and unstated interests of everyone involved, from your core team to your funders and community members.
      </p>
      <p>
        The goal is to give you a clear-eyed view of your project's internal and external dynamics, helping you leverage areas of strong alignment and proactively manage potential conflicts.
      </p>
      
      <h3>What Data Does It Analyze?</h3>
      <p>To generate its report, the AI synthesizes information from multiple sources:</p>
      <ul>
        <li><strong>Project Data:</strong> The project's title, description, background, and schedule.</li>
        <li><strong>Budget Data:</strong> The declared revenues and expenses, which indicate financial priorities.</li>
        <li><strong>Collaborator Data:</strong> The bios and roles of assigned members, which reveal their skills and motivations.</li>
        <li><strong>Community & Audience:</strong> Your descriptions of who the project is for and what impact it aims to have.</li>
      </ul>

      <h3>How to Use the Tool</h3>
      <ol>
        <li>Navigate to the <strong>Interest Compatibility</strong> page from the <code>Tools</code> menu.</li>
        <li>Select the project you wish to analyze.</li>
        <li>Click "Generate Report".</li>
      </ol>
      
      <p>
        The AI will produce a comprehensive report broken down into several key sections.
      </p>
      
      <h3>Understanding the Report Sections</h3>
      <ul>
        <li>
          <strong>Executive Summary:</strong> A high-level overview of the stakeholder landscape for your project.
        </li>
        <li>
          <strong>Stakeholder Analysis:</strong> A list of all key stakeholders (e.g., Lead Artist, Funder, Community Partner) and a bulleted list of their likely interests based on the data.
        </li>
        <li>
          <strong>High Compatibility Areas:</strong> This is the "good news" section. It highlights where the interests of different stakeholders overlap, creating natural synergies. For example, a funder's interest in "community engagement" might align perfectly with a lead artist's interest in "co-creation with local residents." The report explains why this alignment is a key strength.
        </li>
        <li>
          <strong>Potential Conflicts:</strong> This is your risk management section. It identifies areas where interests might diverge. For example, the team's interest in "artistic experimentation" might conflict with a venue partner's interest in "maximizing ticket sales." The report doesn't just point out the problem; it also suggests a mitigation strategy.
        </li>
        <li>
          <strong>Actionable Recommendations:</strong> A list of concrete next steps you can take to leverage the compatibilities and address the potential conflicts.
        </li>
      </ul>
       <InfoBox type="tip">
        <p><strong>A Tool for Facilitation:</strong> This report is an excellent document to bring to a project kick-off meeting. It provides a neutral, data-driven starting point for important conversations about expectations, roles, and shared goals, ensuring everyone is on the same page from the beginning.</p>
      </InfoBox>
    </div>
  );
};

export default InterestCompatibilityGuide;
