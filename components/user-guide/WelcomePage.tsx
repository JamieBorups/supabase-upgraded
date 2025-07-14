
import React from 'react';
import InfoBox from './InfoBox';

const WelcomePage: React.FC = () => {
  return (
    <div>
      <h2>Welcome to The Arts Incubator!</h2>
      <p>
        This application is your all-in-one digital workspace, designed to help you and your arts collective manage projects from the initial spark of an idea all the way to the final report. We understand that arts administration can be complex, so we've built a tool to streamline the process, combining project management, budgeting, time tracking, and external communications into a single, cohesive platform.
      </p>

      <h3>Our Philosophy &amp; Origins</h3>
      <p>
          This platform was prototyped by reverse-engineering core elements of the Ontario Arts Council's Nova and the Manitoba Arts Council's Manipogo granting systems. Our goal was to demystify the grant application process by creating a workspace that mirrors the logic and requirements of major public funders.
      </p>
      <p>
          The program's design also builds on strategic digital and arts innovation research piloted by the Canada Council for the Arts Digital Greenhouse. We believe in providing artists with digital tools that not only streamline administration but also foster new creative possibilities.
      </p>
      <p>
          A key part of this vision is the deep integration of Artificial Intelligence. This work was made possible through early-stage support from the OpenAI Researcher Access Program, which allowed us to explore how AI can act as a creative co-pilot for artists. From generating first drafts to analyzing project strengths, the AI is designed to be a supportive partner, not just a tool, helping you articulate your vision with clarity and confidence.
      </p>

      <h3>Core Concepts</h3>
      <p>
        Understanding how data is connected in this application is key to using it effectively. Here are a few core relationships:
      </p>
      <ul>
        <li><strong>Projects are the center:</strong> Almost everything—tasks, events, reports, and budgets—is linked to a specific project.</li>
        <li><strong>Members do the work:</strong> People in your <code>Members</code> list can be assigned as collaborators on projects and assigned to specific <code>Tasks</code>.</li>
        <li><strong>Tasks drive the budget:</strong> When you create a time-based <code>Task</code>, you can link it to a specific line item in that project's <code>Budget</code>. When a member logs hours against that task (an <code>Activity</code>) and it's approved, the system automatically calculates the "Actual" cost and updates the project's financial reports.</li>
        <li><strong>Events use Venues and Tickets:</strong> You create reusable <code>Venues</code> and <code>Ticket Types</code> first. Then, you create an <code>Event</code> and assign a venue and ticket types to it. This modular approach saves you from re-entering the same information repeatedly.</li>
      </ul>

      <h3>What is this User Guide?</h3>
      <p>
        This guide is your built-in manual for the entire application. We've broken it down into sections that match the main menu items you see at the top of the page. The goal is to provide quick, clear answers so you can spend less time figuring things out and more time creating. Each section will explain:
      </p>
      <ul>
        <li><strong>What it is:</strong> The main purpose of the section and how it fits into the larger workflow.</li>
        <li><strong>How to use it:</strong> Step-by-step instructions for key actions like creating a new project, adding a member, or generating a report.</li>
        <li><strong>Tips and Tricks:</strong> Advice on how to get the most out of each feature, including how to leverage the integrated AI assistants.</li>
      </ul>
      
      <h3>How the App is Structured</h3>
      <p>
        The application is organized into several key areas:
      </p>
      <ol>
        <li><strong>Core Modules:</strong> These are the main navigation links like <code>Projects</code>, <code>Members</code>, <code>Tasks</code>, and <code>Events</code>. These are the building blocks of your day-to-day work.</li>
        <li><strong>Tools Menu:</strong> Located in the top-right, this dropdown contains powerful utilities, including all the specialized AI workshops and data import/export functions.</li>
        <li><strong>Settings:</strong> This is where you can customize the application, from changing your collective's name to fine-tuning the AI's personality.</li>
      </ol>
      
      <InfoBox type="tip">
        <p><strong>Getting Started:</strong> If you're brand new, we recommend starting with the <code>Projects & Proposals</code> guide to learn how to create your first project. If you'd like to see the application in action with pre-filled data, head over to the <code>Tools</code> guide to learn about loading sample data.</p>
      </InfoBox>
      
      <p>
        We're excited to see what you create!
      </p>
    </div>
  );
};

export default WelcomePage;
