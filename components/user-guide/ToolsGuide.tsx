
import React from 'react';
import InfoBox from './InfoBox';

const ToolsGuide: React.FC = () => {
  return (
    <div>
      <h2>Tools</h2>
      <p>
        The <code>Tools</code> menu, located in the top-right of the main navigation bar, contains a collection of powerful utilities and developer-focused features designed to enhance your workflow and provide deeper insights into your projects.
      </p>

      <h3>AI-Powered Workshops & Assistants</h3>
      <p>These tools leverage AI to help you brainstorm, analyze, and generate content, saving you time and providing new perspectives.</p>
      <ul>
        <li>
          <strong>AI Project Generator:</strong> A guided workspace to brainstorm and build a new project from scratch. Use the AI to suggest project titles, write background descriptions, and even generate an initial task list.
        </li>
        <li>
          <strong>ECO-STAR AI Workshop:</strong> A specialized workshop to help you frame your project's narrative around community and ecological impact using the ECO-STAR framework. This is great for grants focused on social or environmental outcomes. You can chat with the AI to brainstorm each section or have it generate a complete report.
        </li>
         <li>
          <strong>SDG Alignment Report:</strong> Generate a strategic report analyzing your project's alignment with the UN Sustainable Development Goals.
        </li>
         <li>
          <strong>Framework for Recreation in Canada Alignment Report:</strong> Generate a strategic report that frames your arts project as a recreation program, aligning it with the goals of the Framework for Recreation in Canada.
        </li>
        <li>
          <strong>AI Task Generator:</strong> Select a project and get AI-powered feedback on its tasks. The AI can help you break down large tasks into smaller ones or improve the clarity of a task's title and description, making your workplan more effective.
        </li>
        <li>
          <strong>Project AI Assistant:</strong> Select a project and get feedback on its written components (like the description or background). The AI can help you condense text to meet word limits, expand on ideas, or improve clarity for grant applications.
        </li>
        <li>
          <strong>Interest Compatibility:</strong> An advanced tool that analyzes all data for a selected project (including its description, budget, and collaborators' bios) to generate a report on stakeholder interest alignment. It identifies potential synergies and conflicts between team members, funders, and community goals, helping you proactively manage project relationships.
        </li>
      </ul>
      <InfoBox type="info">
        <p>For more detailed information on the ECO-STAR, SDG Alignment, Interest Compatibility, and Recreation Framework reports, please see the <strong>Supplemental Reports</strong> section of this User Guide.</p>
      </InfoBox>

      <h3>Data Management</h3>
       <InfoBox type="warning">
        <p>Use the data management tools with care, especially the "Restore from Backup" feature, as it can overwrite your existing data.</p>
       </InfoBox>
      <ul>
        <li>
          <strong>Import / Export Data:</strong> This powerful page allows you to back up and restore your data. You can export your entire workspace, a single project, or just your contacts or AI settings. This is useful for backups, sharing a project with another group using the same software, or for migrating data.
        </li>
      </ul>

      <h3>Developer & Testing Tools</h3>
      <ul>
        <li>
          <strong>Data Schema Report:</strong> A developer-focused, read-only report showing the structure and default values for every major data model in the application. Useful for understanding the database structure.
        </li>
        <li>
          <strong>Database Test:</strong> A page to generate the SQL schema for the entire application, useful for database migrations or replication.
        </li>
      </ul>
    </div>
  );
};

export default ToolsGuide;
