
import React from 'react';
import InfoBox from './InfoBox';

const ProjectsGuide: React.FC = () => {
  return (
    <div>
      <h2>Projects & Proposals</h2>
      <p>
        The "Projects" section is the heart of the application. It's where you'll manage everything from your initial grant application to the final version of your artistic work. This section is divided into two main areas, accessible from the "Projects" dropdown in the main menu: <code>Project List</code> and <code>Reporting & Archives</code>.
      </p>

      <h3>Project List</h3>
      <p>
        This is your main dashboard for all projects. From here, you can see every project your collective is working on, has completed, or has on hold.
      </p>
      <h4>Key Actions:</h4>
      <ul>
        <li><strong>Add New Project:</strong> Click this button to start a new, blank project. You'll be taken directly to the Project Editor.</li>
        <li><strong>View:</strong> Click the "View" button on any project to see its detailed <strong>Project Viewer</strong>. This is perfect for reviewing project details, checking on budgets, and seeing activity insights without the risk of accidentally changing something.</li>
        <li><strong>Edit:</strong> This takes you to the Project Editor, where you can fill out or change any information about the project.</li>
        <li><strong>Delete:</strong> This will permanently remove a project and all its associated data (tasks, activities, etc.). Use with caution!</li>
        <li><strong>Change Status:</strong> Use the small dropdown menu (three dots) to quickly change a project's status (e.g., from "Active" to "Completed").</li>
      </ul>

      <h3>The Project Editor: Building Your Application</h3>
      <p>
        When you add or edit a project, you'll work within the Project Editor. Its tabbed interface is designed to mirror a typical grant application, helping you build a comprehensive proposal.
      </p>
      <ul>
          <li><strong>Project Information Tab:</strong> This is where you enter the core narrative of your project—the what, why, and how. The fields are designed to prompt you for the kind of detailed information that funders look for, from your artistic background to your community impact statement.</li>
          <li><strong>Collaborators Tab:</strong> Here, you describe your team. You can also assign members from your <code>Members</code> list to specific roles on this project. This is crucial, as only assigned collaborators can be assigned to tasks for this project.</li>
          <li><strong>Budget Tab:</strong> This is an interactive budgeting tool. You can add revenue sources (like grants) and detailed expense items (like artist fees or venue rentals). As you'll see in the Tasks section, this budget becomes dynamic when you link tasks to these expense items.</li>
      </ul>

      <h3>The Project Viewer: A Deep Dive</h3>
      <p>The Project Viewer gives you a comprehensive, 360-degree look at a single project through several tabs:</p>
      <ul>
        <li><strong>Project Info:</strong> A clean, read-only view of the project's core narrative and details as entered in the editor.</li>
        <li><strong>Collaborators:</strong> See who is assigned to the project and read their bios.</li>
        <li>
          <strong>Budget vs. Actuals:</strong> This is a powerful financial dashboard.
          <ul>
              <li>The <strong>Budgeted</strong> amount for each line item comes from what you entered in the Project Editor's budget tab.</li>
              <li>The <strong>Actuals</strong> are calculated automatically. When a team member logs time (an <strong>Activity</strong>) against a <strong>Task</strong> that is linked to a budget line item, the system multiplies the hours by the task's hourly rate and adds it to the "Actual Paid" total once the activity is approved. This gives you a real-time view of your spending.</li>
          </ul>
        </li>
        <li><strong>Workplan:</strong> This tab provides a Gantt chart-like view of your project's milestones and tasks over time. It helps you visualize your project timeline and see how different phases overlap.</li>
        <li><strong>Activity & Insights:</strong> A real-time dashboard showing the pulse of your project. Here you can see a live feed of all approved activities and direct expenses, and get a breakdown of which collaborators are contributing the most hours.</li>
        <li><strong>External Contacts:</strong> A list of all contacts from your CRM (e.g., funders, media) that have been associated with this project.</li>
      </ul>
      
      <h3>Proposal Snapshots</h3>
      <p>
        A Proposal Snapshot is a <strong>read-only, point-in-time copy</strong> of a project. Think of it as a "photograph" of your project at a specific moment, capturing all its details, budget, and tasks. You can find your saved snapshots in the <code>Reporting & Archives</code> page.
      </p>
       <InfoBox type="tip">
          <p><strong>Why use Snapshots?</strong> They are essential for good record-keeping.</p>
          <ul>
            <li><strong>Grant Submissions:</strong> Create a snapshot right before you submit a grant. This gives you a permanent record of exactly what the funder saw, even if you continue to update the live project later.</li>
            <li><strong>Versioning:</strong> Save important versions of a project at key milestones (e.g., "Pre-Workshop Version", "Final Rehearsal Draft").</li>
            <li><strong>Reporting:</strong> Compare a project's final state to how it was originally proposed.</li>
          </ul>
       </InfoBox>
      <h4>How to Create a Snapshot:</h4>
      <ol>
        <li>Go to the main <code>Project List</code> and click "View" on the project you want to capture.</li>
        <li>In the Project Viewer, click the <code>Create Proposal Snapshot</code> button.</li>
        <li>Add some optional notes for context (e.g., "Version submitted to Canada Council - March 15").</li>
        <li>Click "Save Snapshot".</li>
      </ol>
      <p>You can then view, manage, or delete these snapshots from the <code>Reporting & Archives</code> page, accessible via the main "Projects" dropdown menu.</p>
    </div>
  );
};

export default ProjectsGuide;
