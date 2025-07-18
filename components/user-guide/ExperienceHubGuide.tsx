
import React from 'react';
import InfoBox from './InfoBox';

const ExperienceHubGuide: React.FC = () => {
  return (
    <div>
      <h2>Experience Hub</h2>
      <p>
        The <strong>Experience Hub</strong> is a powerful tool designed to help you and your members translate project contributions into tangible, professional assets. It bridges the gap between the often informal work of arts projects and the formal language required for resumes, LinkedIn profiles, grant proposals, and job applications.
      </p>
      <p>
        It uses AI to analyze all the data from a selected project to generate high-quality, professionally-worded job descriptions and accomplishment statements that accurately reflect the value of the work performed.
      </p>
      
      <h3>The Workflow: From Project to Professional Asset</h3>
      <p>
        The process is designed to be straightforward and collaborative with the AI assistant.
      </p>
      <ol>
        <li>
          <strong>Select a Project:</strong> The first step is always to select a project from the filter dropdown at the top of the page. All generated descriptions are linked to a specific project, as this provides the necessary context for the AI.
        </li>
        <li>
          <strong>Generate New Description:</strong> Click the "Generate New Description" button. This will open a configuration modal where you provide the initial parameters for the AI.
        </li>
        <li>
          <strong>Configure the Generation:</strong> In the modal, you'll set:
          <ul>
            <li><strong>Role Title:</strong> The job title you want to create (e.g., "Lead Muralist", "Project Coordinator").</li>
            <li><strong>Seniority Level:</strong> This helps the AI tailor the language (e.g., Entry-Level vs. Management).</li>
            <li><strong>Assign to Member (Optional):</strong> If you select a specific member who performed this role, the AI will use their bio as additional context, leading to a more personalized description. If left blank, a generic role description is created.</li>
            <li><strong>Tailor the Description:</strong> Use the checkboxes to tell the AI which skills or fields to emphasize. Selecting "Focus on Transferable Skills" will prompt the AI to explicitly highlight skills that are valuable outside of the arts sector, such as budget management or public speaking.</li>
          </ul>
        </li>
        <li>
          <strong>Review and Edit:</strong> After you click "Generate", you are taken to the <strong>Editor</strong>. The AI generates the content in the background and populates the fields. You are in full control to review, edit, and refine every section to perfectly match your needs.
        </li>
        <li>
          <strong>Save:</strong> Once you're happy with the description, click "Save". It will now appear in the library for that project.
        </li>
      </ol>
      
      <h3>The Viewer: Your Copy-Paste Hub</h3>
      <p>
        From the main list, click "View" on any saved description. The <strong>Viewer</strong> provides a clean, read-only display of all the generated content.
      </p>
      <InfoBox type="tip">
        <p><strong>Designed for Easy Copying:</strong> Every section in the Viewer has a "Copy" button. This copies the content to your clipboard as plain text, without any special formatting. This makes it incredibly easy to paste the content directly into a LinkedIn profile, a resume document, or an online application form.</p>
      </InfoBox>

      <h3>System-Defined Roles</h3>
      <p>
        When no project is selected, the Experience Hub displays a list of system-defined roles. These are pre-written, non-editable descriptions that document the types of work involved in contributing to the Arts Incubator platform itself. This allows members who help design, develop, or manage this platform to have a ready-made, professional summary of their valuable technical and strategic contributions.
      </p>
    </div>
  );
};

export default ExperienceHubGuide;
