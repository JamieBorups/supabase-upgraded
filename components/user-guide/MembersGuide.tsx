
import React from 'react';
import InfoBox from './InfoBox';

const MembersGuide: React.FC = () => {
  return (
    <div>
      <h2>Members & Experience</h2>
      <p>
        The <code>Members</code> section in the main menu is now a dropdown that contains two key areas for managing and supporting the people in your collective: <strong>Member Profiles</strong> and the <strong>Experience Hub</strong>.
      </p>
      
      <h3>Member Profiles</h3>
      <p>
        This section is your central database for everyone in your arts collective. Keeping this information up-to-date is important because it's used throughout the application to assign collaborators to projects and tasks.
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

      <h4>The Member List</h4>
      <p>
        This page shows a list of all members you have added to the application.
      </p>
      <h5>Key Actions:</h5>
      <ul>
        <li><strong>Add New Member:</strong> Click this button to open the Member Editor and add a new person to your collective.</li>
        <li><strong>View:</strong> Opens the <strong>Member Viewer</strong>, a detailed dashboard for that person.</li>
        <li><strong>Edit:</strong> Open the Member Editor to update a member's information.</li>
        <li><strong>Delete:</strong> Permanently remove a member from the collective. This will also un-assign them from any projects or tasks they were linked to.</li>
      </ul>

      <h4>The Member Viewer: A 360-Degree Profile</h4>
      <p>
        When you view a member, you get a comprehensive dashboard of their involvement in the collective. It's an excellent tool for understanding individual workload, contributions, and areas of expertise.
      </p>
        <ul>
            <li>
              <strong>Profile Information Tab:</strong> This tab displays the member's contact details and full biographies. Below that, it provides a complete list of every project the member is assigned to. For each project, you can see their role, their progress on assigned tasks, and a financial summary of their paid vs. in-kind contributions. This is perfect for annual reviews or preparing personalized reports.
            </li>
            <li>
              <strong>Activity Report Tab:</strong> This tab provides a high-level summary of the member's contributions across <strong>all</strong> of their projects. It includes snapshot metrics like total hours logged, the number of projects they are working on, and a visual chart showing how their hours are distributed across different projects.
            </li>
        </ul>

      <h4>The Member Editor</h4>
      <p>
        When you add or edit a member, you'll use this form to fill in their details.
      </p>
        <InfoBox type="tip">
          <p><strong>Keep Bios Updated:</strong> The <code>Short Bio</code> and <code>Full Artist Bio</code> fields are used by the AI when generating content for other parts of the app, like the Interest Compatibility Assessment. Keeping these bios rich with detail will lead to better AI insights!</p>
       </InfoBox>

      <h3>Experience Hub</h3>
      <p>
        The <strong>Experience Hub</strong> is a new, powerful tool designed to help members translate their project contributions into tangible, professional assets for their resumes, LinkedIn profiles, and portfolios. It uses AI to analyze project data and generate high-quality, professionally-worded job descriptions and accomplishment statements.
      </p>
      <p>
        For a full breakdown of this feature, please see the dedicated <strong>Experience Hub</strong> section in this user guide.
      </p>
    </div>
  );
};

export default MembersGuide;
