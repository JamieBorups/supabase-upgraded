import React from 'react';
import InfoBox from './InfoBox';

const MediaGuide: React.FC = () => {
  return (
    <div>
      <h2>Media & Contacts</h2>
      <p>
        The <code>Media</code> dropdown in the main menu contains tools for managing your collective's external communications and public-facing content. It's broken into three parts: <code>News Releases</code>, <code>Contacts</code>, and <code>Highlights</code>.
      </p>

      <h3>News Releases</h3>
      <p>
        This section helps you create, manage, and archive official communications for your projects. While it's called "News Releases," you can use it for any formal text, like project updates, media advisories, or even social media posts.
      </p>
      <h4>Key Features:</h4>
      <ul>
        <li><strong>Project-Based:</strong> Communications are organized by the project they relate to, keeping everything tidy.</li>
        <li><strong>AI Generation:</strong> Use the "Generate with AI" button to create a first draft. The AI will analyze your project's information (description, collaborators, schedule) to write a professional-sounding release, saving you significant time.</li>
        <li><strong>Print-Friendly View:</strong> The "View" button opens a clean, printable version of your release, perfect for sending to media contacts or including in a press kit.</li>
      </ul>
       <InfoBox type="tip">
        <p><strong>Customize Your AI Writer:</strong> Don't like the default tone? Go to <code>Settings &gt; AI Settings &gt; Media</code> to create custom AI templates. You could create one for a "Formal Announcement" and another for a "Casual Community Update" to generate different styles of content instantly.</p>
      </InfoBox>
      <h3>Contacts (CRM)</h3>
      <p>
        This is your built-in Customer Relationship Manager (CRM). It's a central database for all your external contacts, such as journalists, funders, community partners, and venue managers.
      </p>
      <h4>Key Features:</h4>
      <ul>
        <li><strong>Contact Profiles:</strong> Store detailed information for each contact, including their organization, title, and address.</li>
        <li><strong>Tags & Types:</strong> Organize your contacts with customizable types (like "Media" or "Funder") and specific tags for powerful filtering.</li>
        <li><strong>Interaction Log:</strong> For each contact, you can log interactions like emails, phone calls, or meetings. This helps you keep a complete history of your relationship with key stakeholders.</li>
        <li><strong>Project Association:</strong> Link contacts directly to the projects they are involved with. This lets you see all external parties related to a project in one place from the Project Viewer.</li>
      </ul>

      <h3>Highlights</h3>
      <p>
        The <code>Highlights</code> section is a simple place to store and organize links to external content about your projects. It's a great way to keep track of your successes and documentation for reporting purposes.
      </p>
      <h4>How to Use It:</h4>
      <p>
        Click "Add New Highlight", give it a title, paste the URL, and link it to the relevant project. Examples of things to save here include:
      </p>
      <ul>
        <li>Links to news articles or reviews about your work.</li>
        <li>Links to YouTube or Vimeo videos of a performance.</li>
        <li>Links to a photo gallery from an event.</li>
        <li>Links to a podcast episode where your project was discussed.</li>
      </ul>
    </div>
  );
};

export default MediaGuide;