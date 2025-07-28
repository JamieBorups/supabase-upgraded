import React from 'react';
import InfoBox from './InfoBox';

const July182025Updates: React.FC = () => {
  return (
    <div>
      <h2>Recent Updates: July 18th, 2025</h2>
      <p>
        This update marks a significant milestone in our mission to empower artists with powerful, intuitive tools. We've introduced a suite of new features and enhancements focused on professional development, strategic planning, and overall administrative efficiency. The application is now more capable than ever of supporting your creative work from concept to final report.
      </p>

      <h3>Key Feature Spotlight</h3>

      <h4>New AI-Powered Strategic Workshops</h4>
      <p>
        We have expanded our suite of AI-powered supplemental reports, providing you with even more tools to analyze and communicate the strategic value of your projects. These can be found in the <code>Tools</code> menu.
      </p>
      <ul>
        <li>
          <strong>ECO-STAR Workshop:</strong> This tool helps you frame your project's narrative around a business and sustainability model, analyzing its Environment, Customer, Opportunity, Solution, Team, Advantage, and Results. It's ideal for social enterprise grants and proposals to partners focused on community or environmental impact.
        </li>
        <li>
          <strong>Interest Compatibility Assessment:</strong> This advanced tool acts as a "relationship check-up" for your project. The AI analyzes all project data to identify synergies and potential conflicts between stakeholders (team members, funders, community), providing actionable recommendations to ensure project success.
        </li>
      </ul>
      
      <h3>Current State of the Application</h3>
      <p>
        With these updates, the Arts Incubator now provides a seamless workflow across all core areas of arts administration:
      </p>
      <ul>
        <li><strong>Core Modules:</strong> Full functionality for managing <strong>Projects</strong>, <strong>Members</strong>, <strong>Tasks</strong>, <strong>Events & Venues</strong>, <strong>Marketplace (Sales)</strong>, and <strong>Media & Contacts</strong> remains robust and is now enhanced by the new strategic tools.</li>
        <li><strong>Integrated AI:</strong> The AI co-pilot is more deeply integrated than ever, assisting with everything from drafting initial project descriptions and creating workplans to generating final reports and professional summaries.</li>
        <li><strong>Comprehensive Reporting:</strong> The <strong>Reporting & Archives</strong> section is now a central hub for all project documentation, including Final Reports, Proposal Snapshots, and all saved Supplemental Reports (ECO-STAR, SDG, etc.), providing a complete history of your project's lifecycle.</li>
      </ul>

      <InfoBox type="tip">
        <p><strong>Explore the New Features!</strong> We encourage you to run a new project through the ECO-STAR workshop. The insights you gain can be invaluable for your next funding application.</p>
      </InfoBox>
    </div>
  );
};

export default July182025Updates;