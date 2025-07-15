
import React from 'react';
import InfoBox from './InfoBox';

const TasksGuide: React.FC = () => {
  return (
    <div>
      <h2>Tasks & Activities</h2>
      <p>
        The <code>Tasks</code> section is where you manage the day-to-day work of your projects. It allows you to break down large projects into manageable pieces and track the time spent on them.
      </p>
      <p>
        To get started, first select a project from the dropdown menu at the top of the page to filter the views.
      </p>
      
      <h3>The Three Views of Task Management</h3>
      <p>This module is organized into three tabs, each offering a different perspective on your project's work:</p>
      <ol>
          <li><strong>Tasks:</strong> The best place to build and organize your workplan.</li>
          <li><strong>Workplan Report:</strong> The best place to see how your tasks connect to your budget.</li>
          <li><strong>Timesheet:</strong> The best place to log and approve time worked on tasks.</li>
      </ol>

      <h3>1. The 'Tasks' Tab: Building Your Workplan</h3>
      <p>
        This is a visual task management view where you can see all tasks for the selected project, organized into milestones. Use the "Add Task" button to create new work items for your project.
      </p>
      <InfoBox type="info">
        <h4>Task Types Explained</h4>
        <p>There are two types of tasks you can create:</p>
        <ul>
            <li><strong>Milestone:</strong> This is a high-level phase or deliverable (e.g., "Phase 1: Research & Development"). It acts as a container for smaller tasks but does not track time or costs itself. Think of it as a folder.</li>
            <li><strong>Time-Based:</strong> This is the most common type of task (e.g., "Research archival photos" or "Rehearse Act 1"). You can assign it to a member, estimate the hours required, and link it to a budget line item. This is where members log their time.</li>
        </ul>
      </InfoBox>
      <h4>Workflow Tip:</h4>
      <p>A good workflow is to first create all your major Milestones for the project. Then, create the individual Time-Based tasks and assign each one to its parent milestone. This creates a clear, hierarchical workplan.</p>

      <h3>2. The 'Workplan Report' Tab: A Financial Overview</h3>
      <p>
        This view provides a high-level financial breakdown of your project's workplan. It groups your tasks by the budget expense category they are linked to, making it easy to see how your planned work maps to your financial plan. It is a read-only report designed for analysis, not for editing tasks.
      </p>
      
      <h3>3. The 'Timesheet' Tab: Logging and Approving Time</h3>
      <p>
        This view is your master log of all time-tracking entries (known as <strong>Activities</strong>). It is organized by task and is the primary place to log time and approve those logs.
      </p>
       <h4>The Approval Workflow:</h4>
      <ol>
        <li><strong>Log Time:</strong> A team member clicks the "Log Time" button next to a task they've worked on.</li>
        <li><strong>Activity Created:</strong> They fill out the details (hours, description) and save. This creates an Activity with a "Pending" status.</li>
        <li><strong>Approve Time:</strong> A project manager or administrator can then go to the `Activities` tab in the main menu, view all pending activities, and click "Approve".</li>
      </ol>
      <InfoBox type="tip">
        <p><strong>Why is Approval Important?</strong> Only <strong>Approved</strong> activities are included in the financial calculations for the project's budget. This workflow allows a project manager to verify work before it impacts the financial reports, ensuring accuracy.</p>
      </InfoBox>
    </div>
  );
};

export default TasksGuide;
