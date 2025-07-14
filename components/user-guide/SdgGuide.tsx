import React from 'react';
import InfoBox from './InfoBox';

const SdgGuide: React.FC = () => {
  return (
    <div>
      <h2>SDG Alignment Report</h2>
      <p>
        The <strong>SDG Alignment Report</strong> tool is a highly specialized feature designed to position your arts project within a global framework of sustainable development. It analyzes your project data and generates a formal report that connects your work to the United Nations Sustainable Development Goals (SDGs).
      </p>
      
      <h3>What are the SDGs?</h3>
      <p>
        The 17 Sustainable Development Goals are a universal call to action by all countries to promote prosperity while protecting the planet. They recognize that ending poverty must go hand-in-hand with strategies that build economic growth and address a range of social needs including education, health, social protection, and job opportunities, while tackling climate change and environmental protection.
      </p>
      <InfoBox type="info">
        <p>Many large foundations, corporate sponsors, and government funders (especially at the federal level) are increasingly using the SDGs as a framework to evaluate the impact of the projects they support. Being able to articulate your project's alignment with these goals can make your proposal significantly more competitive.</p>
      </InfoBox>

      <h3>How to Use the Tool</h3>
      <p>
        The SDG Alignment tool is located in the <code>Tools</code> menu. The process is straightforward:
      </p>
      <ol>
        <li>Select the project you wish to analyze from the dropdown menu.</li>
        <li>Click the "Generate Report" button.</li>
      </ol>
      <p>
        The AI will then perform a comprehensive analysis of your entire project—its description, budget, schedule, collaborators, and stated goals—to identify the most relevant SDGs it aligns with. It will then generate a multi-part report that includes:
      </p>
      <ul>
        <li><strong>An Executive Summary:</strong> A professional overview of the project's connection to the SDGs.</li>
        <li><strong>Detailed Goal Analysis:</strong> An in-depth look at the top 2-3 most relevant SDGs, with detailed narratives explaining the alignment, its strategic value, and potential challenges.</li>
        <li><strong>Strategic Recommendations:</strong> High-level suggestions for how to further strengthen your project's SDG alignment.</li>
      </ul>

      <h3>What to Do with the Report</h3>
      <p>
        Once generated, you can save the report as a PDF or copy its content. Here are a few ways to use it:
      </p>
      <ul>
        <li><strong>Append to Grant Proposals:</strong> Attach the PDF as a supplementary document to grant applications to showcase your project's broader impact.</li>
        <li><strong>Inform Partnership Proposals:</strong> Use the language and analysis from the report to create compelling proposals for corporate or non-profit partners who are focused on social responsibility.</li>
        <li><strong>Strategic Planning:</strong> Use the report internally with your team to brainstorm ways to deepen your community impact and align your future projects with global priorities.</li>
      </ul>
       <InfoBox type="tip">
        <p><strong>Improve Your AI's Output:</strong> The quality of the SDG report depends on the quality of your project data. Before generating the report, make sure your project's description, background, and community impact sections are well-written and detailed. The more information the AI has, the more nuanced and accurate its analysis will be.</p>
      </InfoBox>
    </div>
  );
};

export default SdgGuide;
