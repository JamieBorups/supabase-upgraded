import React from 'react';
import InfoBox from './InfoBox';

const MembersGuide: React.FC = () => {
  return (
    <div>
      <h2>Members</h2>
      <p>
        The <code>Members</code> section is your central database for everyone in your arts collective. Keeping this information up-to-date is important because it's used throughout the application to assign collaborators to projects and tasks.
      </p>

       <InfoBox type="info">
        <h4>Member vs. User Account</h4>
        <p>It's important to understand the difference between a <strong>Member</strong> and a <strong>User</strong>:</p>
        <ul>
          <li>A <strong>Member</strong> is a profile for a person in your collective. It contains their bio, contact info, and is used for assigning work.</li>
          <li>A <strong>User</strong> is a login account (username and password) that allows someone to access the application.</li>
        </ul>
        <p>In the <code>Settings &gt; Users</code> page, you can link a User account to a Member profile. This is how the system knows who is logged in.</p>
      </InfoBox>

      <h3>The Member List</h3>
      <p>
        This page shows a list of all members you have added to the application.
      </p>
      <h4>Key Actions:</h4>
      <ul>
        <li><strong>Add New Member:</strong> Click this button to open the Member Editor and add a new person to your collective.</li>
        <li><strong>View:</strong> Opens the <strong>Member Viewer</strong>, a detailed dashboard for that person.</li>
        <li><strong>Edit:</strong> Open the Member Editor to update a member's information.</li>
        <li><strong>Delete:</strong> Permanently remove a member from the collective. This will also un-assign them from any projects or tasks they were linked to.</li>
      </ul>

      <h3>The Member Viewer</h3>
      <p>When you view a member, you'll see a dashboard with two tabs:</p>
        <ul>
            <li><strong>Profile Information:</strong> Displays the member's contact details, bios, and a full list of all the projects they are assigned to, including their role and progress on tasks for each project.</li>
            <li><strong>Activity Report:</strong> A high-level summary of the member's contributions across all their projects, including total hours logged and a visual breakdown of their effort by project.</li>
        </ul>

      <h3>The Member Editor</h3>
      <p>
        When you add or edit a member, you'll use this form to fill in their details.
      </p>
        <InfoBox type="tip">
          <p><strong>Keep Bios Updated:</strong> The <code>Short Bio</code> and <code>Full Artist Bio</code> fields are used by the AI when generating content for other parts of the app, like the Interest Compatibility Assessment. Keeping these bios rich with detail will lead to better AI insights!</p>
       </InfoBox>
    </div>
  );
};

export default MembersGuide;