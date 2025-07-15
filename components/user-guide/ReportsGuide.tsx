
import React from 'react';
import InfoBox from './InfoBox';

const ReportsGuide: React.FC = () => {
  return (
    <div>
      <h2>Reporting & Archives</h2>
      <p>
        The Reporting & Archives section, accessible from the "Projects" dropdown in the main menu, is your central hub for project documentation and final reporting. To begin, select a project from the dropdown at the top of the page. All tabs will then show information relevant to that project.
      </p>
      
      <h3>Final Reporting Tab</h3>
      <p>
        This tab is for creating official final reports for your completed projects, which are often required by funders. The report structure is based on a standard final report format for arts grants, automating much of the data collection process for you.
      </p>
      <h4>The Reporting Workflow</h4>
      <ol>
        <li>
          <strong>Complete a Project:</strong> A project's status must be set to "Completed" to be eligible for a report. You can do this from the main <code>Projects</code> page using the status dropdown (the three dots on the right side of a project).
        </li>
        <li>
          <strong>Select the Project:</strong> On this page, select a completed project from the top dropdown menu.
        </li>
        <li>
          <strong>Fill Out the Report:</strong> The form is divided into several sections. Much of the financial data is pulled automatically from your project's budget and approved activity logs. You will need to fill in the narrative sections, such as "Project Results" and "Feedback".
        </li>
        <li>
          <strong>Edit and Save:</strong> Click the "Edit Report" button to make changes. When you're done, click "Save Report". Your progress is saved, so you can come back and work on it later.
        </li>
        <li>
          <strong>Generate PDF:</strong> Once you are satisfied with the report, click the "Generate PDF" button. This will create a clean, formatted PDF document of the entire report, ready for you to save, print, or email to your funder.
        </li>
      </ol>
      <InfoBox type="info">
        <p>When you first mark a project as "Completed", a popup will ask if you want to navigate to the Reports page immediately. If you accept, it will automatically select the correct project for you.</p>
      </InfoBox>

      <h3>Proposal Snapshots Tab</h3>
      <p>
        A Proposal Snapshot is a <strong>read-only, point-in-time copy</strong> of a project. Think of it as a "photograph" of your project at a specific moment, capturing all its details, budget, and tasks. You can manage all snapshots for your selected project here.
      </p>
       <InfoBox type="tip">
          <p><strong>Why use Snapshots?</strong> They are essential for good record-keeping.</p>
          <ul>
            <li><strong>Grant Submissions:</strong> Create a snapshot right before you submit a grant. This gives you a permanent record of exactly what the funder saw.</li>
            <li><strong>Versioning:</strong> Save important versions of a project at key milestones.</li>
          </ul>
       </InfoBox>

       <h3>Supplemental Reports Tab</h3>
       <p>
         This tab is where you can find all of the AI-generated strategic reports you have saved from the various AI Workshop tools for the selected project. These are powerful documents that can be used for strategic planning, fundraising, and partnership development.
       </p>
       <p>
         For a detailed breakdown of each type of supplemental report and how to use them, please see the <strong>Supplemental Reports</strong> section of this User Guide.
       </p>
    </div>
  );
};

export default ReportsGuide;
