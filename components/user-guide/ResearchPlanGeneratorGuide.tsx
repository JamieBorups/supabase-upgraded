

import React from 'react';
import InfoBox from './InfoBox';

const ResearchPlanGeneratorGuide: React.FC = () => {
  return (
    <div>
      <h2>Research Plan Generator</h2>
      <p>
        The <strong>Research Plan Generator</strong> is a sophisticated AI-powered tool designed to help you create comprehensive, rigorous, and funder-ready Community-Based Research (CBR) plans. It streamlines the writing process by synthesizing your project's details with established research methodologies, ensuring your plan is both well-structured and ethically sound.
      </p>

      <h3>What is it for?</h3>
      <p>
        This tool is invaluable when you need to formalize your artistic inquiry into a research framework, which is often a requirement for academic grants (like SSHRC in Canada or NSF in the US) or proposals to foundations that prioritize evidence-based impact. It helps you articulate not just *what* you are doing, but *how* and *why* you are doing it in a methodologically sound way.
      </p>

      <h3>How it Works: A Collaborative Process</h3>
      <p>The generator is designed to be an interactive workspace where you collaborate with the AI.</p>
      <ol>
        <li><strong>Select Project & Approaches:</strong> Start by selecting the project you want to focus on. Then, you'll be prompted to choose the theoretical approaches that will guide your research. This includes selecting from various <strong>Epistemologies</strong> (ways of knowing), <strong>Pedagogies</strong> (ways of teaching), <strong>Methodologies</strong> (overall strategies), and <strong>Mixed-Methodological Approaches</strong>.</li>
        <li><strong>Generate Content:</strong> You have two options for generating content:
            <ul>
                <li><strong>Generate Full Draft:</strong> Click this button for a fast start. The AI will go through each section of the research plan sequentially, generating a complete first draft for you. It's smart enough to pass context from one section to the next, ensuring a cohesive document.</li>
                <li><strong>Generate Section by Section:</strong> For more control, click the "Generate" button within each specific section (e.g., "Sustainability"). The AI will generate content only for that part.</li>
            </ul>
        </li>
        <li><strong>Edit and Refine:</strong> The generated text appears directly in an editable field. You are in full control to modify, add, or delete any part of the text to ensure it accurately reflects your vision and community agreements.</li>
        <li><strong>Save and Export:</strong> You can save your draft at any time and come back to it later. Saved plans can be found and re-opened from the "Reporting & Archives" page. Once complete, you can export the final plan as a professionally formatted PDF.</li>
      </ol>
      
      <InfoBox type="tip">
        <p><strong>Use the AI as a Co-Pilot:</strong> The quality of the AI's output is directly related to the quality of your input. Before generating, ensure your project's description, background, and collaborator bios are detailed. The more context the AI has, the more nuanced and relevant its suggestions will be. Don't forget to leverage the most recent ECO-STAR report as well, as the AI will consider its strategic analysis when generating your plan!</p>
      </InfoBox>

      <h3>Understanding the Research Approaches</h3>
      <p>
        Selecting the right research approaches is the most critical step in shaping your plan. These choices tell the AI what principles to emphasize in the generated text. For a detailed explanation of what each option means, please refer to the <strong>Research Approaches</strong> page in the user guide menu.
      </p>
      
      <h3>The Sections of the Plan</h3>
      <p>The generator guides you through constructing a comprehensive research plan, broken down into key sections:</p>
      <ul>
        <li><strong>Overview:</strong> A high-level summary of your project.</li>
        <li><strong>Research Questions and Objectives:</strong> The core questions your research seeks to answer.</li>
        <li><strong>Community Engagement and Context:</strong> Details about the community you're working with and how they are involved.</li>
        <li><strong>Research Design and Methodology:</strong> The "how-to" of your research, outlining your methods and theoretical framework.</li>
        <li><strong>Artistic Alignment & Development:</strong> A dedicated section to frame your project's value to the arts sector. It details how artistic disciplines will be applied, how artists will benefit, and how the project contributes to the arts ecosystem. This is critical for arts-specific funders.</li>
        <li><strong>Ethical Considerations and Protocols:</strong> How you will conduct your research ethically, ensuring respect and safety for participants.</li>
        <li><strong>Knowledge Mobilization and Dissemination:</strong> Your plan for sharing the research findings in accessible and impactful ways.</li>
        <li><strong>Project Management and Timeline:</strong> The practical plan for managing the research project, including roles, responsibilities, and key dates.</li>
        <li><strong>Sustainability:</strong> How the project's benefits and activities might continue after the initial research phase.</li>
        <li><strong>Project Evaluation:</strong> How you will measure the success and impact of your project.</li>
      </ul>
    </div>
  );
};

export default ResearchPlanGeneratorGuide;