
import React from 'react';
import InfoBox from './InfoBox';

const SettingsGuide: React.FC = () => {
  return (
    <div>
      <h2>Settings</h2>
      <p>
        The <code>Settings</code> section allows you to customize the application to better fit your collective's workflow and terminology. Changes made here will affect dropdown menus and default values throughout the app.
      </p>
       <InfoBox type="warning">
        <p>Remember to click the <strong>"Save Changes"</strong> button at the bottom of each settings page for your changes to take effect.</p>
      </InfoBox>

      <h3>Settings Categories</h3>
      
      <h4>General</h4>
      <p>Configure application-wide settings.</p>
      <ul>
        <li><strong>Collective Name:</strong> This name will appear in the application header.</li>
        <li><strong>Default Currency & Date Format:</strong> Set the primary currency and date display format for the application.</li>
      </ul>

       <h4>Users (Admin Only)</h4>
        <InfoBox type="warning">
            <p>The <strong>Users</strong> settings page is a critical, administrator-only section for managing who can log into the application. Be careful when making changes here.</p>
        </InfoBox>
      <p>
        It provides the tools to create, manage, and delete user accounts.
      </p>
      <ul>
        <li><strong>Create New User:</strong> Admins can create a new user account by providing a username and password.</li>
        <li><strong>Link to Member:</strong> Each user account can (and should) be linked to a member profile from your <code>Members</code> list.</li>
        <li><strong>Assign Roles:</strong> You can assign a role of either 'User' or 'Admin' to an account. Admins have access to sensitive areas like the Users page itself.</li>
        <li><strong>Security:</strong> For security, passwords are not stored in plaintext. They are immediately and irreversibly hashed. This means that even if the application data were compromised, the actual passwords would remain secure.</li>
        <li><strong>Delete Users:</strong> Admins can delete user accounts. This does not delete the linked member profile, it only removes the user's ability to log in.</li>
      </ul>

      <h4>Projects</h4>
      <p>Create your own custom project statuses (e.g., "In Development", "Awaiting Report") that will appear in the status dropdowns on the Projects page.</p>

      <h4>Proposals</h4>
      <p>Administratively update a proposal snapshot with the latest live data from its source project. This is useful if you want to refresh an old snapshot before sending it out again.</p>
      
      <h4>Sales & Inventory</h4>
      <p>Configure tax rates (PST/GST) for your sales transactions and manage your master list of inventory categories.</p>

      <h4>Budget</h4>
      <p>Customize the labels for revenue and expense line items in the project budget editor to match your accounting terminology.</p>
      
      <h4>Events & Venues</h4>
      <p>Define custom statuses for your venues (e.g., "On Hold", "Scouting") that will appear in the venue editor.</p>

      <h4>Highlights</h4>
      <p>Configure the three images that can appear randomly on the application's splash screen when you first log in.</p>

      <h4>Media & Comms</h4>
      <p>Customize your default boilerplate text for news releases, create custom categories for your contacts (e.g., "Media", "Funder", "Board Member"), and manage AI templates for generating communications.</p>

      <h3>AI Settings Explained: Your Creative Co-Pilot</h3>
      <p>
        This is a powerful section where you can configure the personality and behavior of the various AI assistants used throughout the application.
      </p>
      <ul>
          <li><strong>Master AI Switch:</strong> Turn all AI features on or off globally. If you're not using the AI, you can disable it here.</li>
          <li><strong>Plain Text Mode:</strong> Some AI responses use Markdown for formatting (like bold text or lists). Toggling this on forces all AI responses into simple plain text, which can be easier to copy and paste into other documents.</li>
          <li><strong>Personas: Giving the AI a Role:</strong> Each tab (Main, Projects, Budget, etc.) has its own "persona." A persona is a set of instructions that tells the AI *how* to behave for that specific part of the app.</li>
          <li><strong>Instructions: The AI's 'Job Description':</strong> This is the most important part of a persona. It's a text box where you give the AI its role and rules. For example, the 'Budget' persona is told to be a "meticulous, friendly bookkeeper," while the 'Projects' persona is an "expert grant writer's assistant." You can edit these instructions to change the AI's tone, focus, and output style.</li>
          <li><strong>Model & Temperature: Tuning the Engine:</strong>
            <ul>
                <li><strong>Model:</strong> This lets you choose which underlying AI model to use. Newer models are generally more capable.</li>
                <li><strong>Temperature:</strong> This slider controls the AI's creativity. A low temperature (e.g., 0.2) makes the AI more focused, factual, and predictable. A high temperature (e.g., 0.9) makes it more creative, experimental, and sometimes random. For factual tasks like summarizing, a low temperature is best. For brainstorming, a higher temperature can be useful.</li>
            </ul>
          </li>
          <li><strong>Templates: Saving Your Best Prompts:</strong> For each persona, you can save and load multiple instruction sets as templates. This is great for quickly switching the AI's behavior without copy-pasting. For example, in the 'Media' persona, you could have a template for a "Formal Press Release" and another for a "Casual Social Media Post."</li>
          <li><strong>Testing:</strong> The "Test Persona" button on each tab is your sandbox. It opens a chat window where you can talk directly to the AI with the settings you've just configured, allowing you to see how it responds before you save your changes.</li>
      </ul>
      
    </div>
  );
};

export default SettingsGuide;
