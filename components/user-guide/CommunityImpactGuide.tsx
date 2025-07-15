import React from 'react';
import InfoBox from './InfoBox';

const CommunityImpactGuide: React.FC = () => {
  return (
    <div>
      <h2>Community Impact</h2>
      <p>
        Tracking and reporting on your project's community impact is crucial for many grant applications and for understanding the real-world value of your work. This application provides two dedicated pages, accessible from the "Projects" dropdown, to help you manage this: <code>Community Reach</code> and <code>Impact Assessment</code>.
      </p>
      <p>
        Both pages are part of the Final Report for a project. While you can edit them here at any time, their primary purpose is to feed into the reporting process once a project is complete.
      </p>

      <h3>Community Reach</h3>
      <p>
        The <code>Community Reach</code> page helps you document <strong>who</strong> your project engaged. It's a simple, checklist-based form that aligns with the demographic questions often asked by public funders.
      </p>
      <h4>How to Use It:</h4>
      <ol>
        <li>Select a project from the dropdown menu.</li>
        <li>
          You'll see two main sections:
          <ul>
            <li><strong>"My activities actively involved individuals who identify as:"</strong> — Use this to specify the demographic groups that participated directly in your project.</li>
            <li><strong>"The activities supported by this grant involved:"</strong> — Use this to specify the broader nature of your project's activities (e.g., if it took place in a regional area or involved youth).</li>
          </ul>
        </li>
        <li>Click "Edit" to make your selections, and "Save Changes" to confirm.</li>
      </ol>
      <InfoBox type="info">
        <p>The selections you make here will be automatically pulled into the "Community Reach" section of that project's Final Report, saving you from having to remember the details later.</p>
      </InfoBox>

      <h3>Impact Assessment</h3>
      <p>
        The <code>Impact Assessment</code> page provides a structured way to evaluate the qualitative impact of your project based on a series of standardized questions. These questions are designed to measure outcomes related to artistic development, career benefit, and community opportunities.
      </p>
       <h4>How to Use It:</h4>
       <ol>
        <li>Select a project from the dropdown menu.</li>
        <li>
          For each statement provided, choose the answer that best reflects your experience with the project, ranging from "Strongly Disagree" to "Strongly Agree".
        </li>
        <li>Click "Edit" to begin making your selections, and "Save Changes" when you are done.</li>
      </ol>
      <p>
        Like the Community Reach data, your answers on this page will be automatically included in the "Impact Assessment" section of the project's Final Report, providing a clear and consistent way to communicate the value of your work to funders.
      </p>
    </div>
  );
};

export default CommunityImpactGuide;
