import React from 'react';
import InfoBox from './InfoBox';

const TasksGuide: React.FC = () => {
  return (
    <div>
      <h2>Tasks & Activities</h2>
      <p>
        The <code>Tasks</code> section is where you manage the day-to-day work of your projects. It allows you to break down large projects into manageable pieces and track the time spent on them. This section has three main views: <code>Workplan Report</code>, <code>Tasks</code>, and <code>Activities</code>.
      </p>
      <p>
        To get started, first select a project from the dropdown menu at the top of the page to filter the views.
      </p>

      <h3>Workplan Report</h3>
      <p>
        This view provides a high-level financial overview of your project's workplan. It groups your tasks by the budget expense category they are linked to, making it easy to see how your planned work maps to your financial plan.
      </p>
      <h4>Key Features:</h4>
      <ul>
        <li><strong>Budget vs. Actuals:</strong> For each expense category, you can see the budgeted amount, the actual cost of paid work logged so far, and the variance.</li>
        <li><strong>Task List:</strong> Under each category, you'll see a list of all the tasks that contribute to that part of the budget.</li>
        <li><strong>Expandable Details:</strong> Click on any task to see the detailed activity logs (time sheets) associated with it.</li>
      </ul>

      <h3>Tasks View</h3>
      <p>
        This is a more traditional task management view where you can see all tasks for the selected project.
      </p>
      <InfoBox type="info">
        <h4>Task Types Explained</h4>
        <p>There are two types of tasks you can create:</p>
        <ul>
            <li><strong>Time-Based:</strong> This is the most common type. It allows members to log hours against it, and it can be linked to a budget line item to track actual costs.</li>
            <li><strong>Milestone:</strong> This is a simple checklist item. It doesn't track hours or link to the budget. Use it for important project markers like "Grant Application Submitted" or "Final Report Filed".</li>
        </ul>
      </InfoBox>
      <h4>Key Features:</h4>
      <ul>
        <li><strong>List and Board Views:</strong> Toggle between a simple list of tasks or a Kanban-style board to drag and drop tasks between statuses.</li>
        <li><strong>Filtering and Sorting:</strong> Use the controls at the top to find specific tasks by searching, filtering by status, or sorting by due date.</li>
        <li><strong>Add Task:</strong> Once a project is selected, you can click "Add Task" to create a new task. In the Task Editor, you can assign it to a member, set dates, and link it to a budget line item.</li>
      </ul>
      
      <h3>Activities View: The Approval Workflow</h3>
      <p>
        This view is your master log of all time-tracking entries (activities) across all projects. It's the best place to approve time sheets, which is a critical step.
      </p>
       <h4>Key Features:</h4>
      <ul>
        <li><strong>Master Log:</strong> See every single activity logged by every member.</li>
        <li><strong>Filtering:</strong> Use the filters to find specific activities, for example, all "Pending" activities for a specific member.</li>
        <li><strong>Approve Time:</strong> Click the "Approve" button on any pending activity to confirm it. <strong>Approved activities are the only ones included in budget calculations.</strong> This workflow allows a project manager to verify work before it impacts the financial reports.</li>
        <li><strong>Log New Activity:</strong> You can create a new activity log from scratch here, which is useful for administrators logging time on behalf of others.</li>
      </ul>
      <InfoBox type="tip">
        <p><strong>Find Missing Time Sheets:</strong> Use the "Show tasks awaiting activity logs" checkbox at the bottom of the Activities view. This will show you a list of all time-based tasks that have no hours logged against them yet, making it easy to remind team members to submit their time.</p>
      </InfoBox>
    </div>
  );
};

export default TasksGuide;