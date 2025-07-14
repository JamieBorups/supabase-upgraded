import React from 'react';
import InfoBox from './InfoBox';

const RecreationFrameworkGuide: React.FC = () => {
  return (
    <div>
      <h2>Framework for Recreation in Canada Alignment Report</h2>
      <p>
        The <strong>Framework for Recreation in Canada Alignment Report</strong> is a specialized tool designed to help you strategically reframe your arts and culture project in the language of community recreation. This can be a powerful way to unlock funding from sources that prioritize health, wellness, and community engagement over purely artistic merit.
      </p>

      <h3>What is the Framework for Recreation in Canada?</h3>
        <p>
            The Framework for Recreation in Canada is a guiding document for public recreation providers across the country. It outlines a shared vision for recreation's role in enhancing the well-being of individuals, communities, and our natural and built environments. The 2024 update to the Framework emphasizes that recreation is a public good and a critical component of a healthy society.
        </p>
        <p>
            This platform's AI tool is designed to analyze your project and structure a formal report around the Framework's five core goals, helping you demonstrate alignment with national priorities.
        </p>
      <h4>The Five Goals of the Framework</h4>
      <ol>
        <li><strong>Active Living:</strong> Fostering physical literacy and encouraging regular, enjoyable physical activity through a wide range of creative and participatory programs.</li>
        <li><strong>Inclusion and Access:</strong> Ensuring all people, regardless of age, ability, background, or income, have equitable access to high-quality recreation experiences.</li>
        <li><strong>Connecting People with Nature:</strong> Strengthening the bond between people and the natural world for physical and mental well-being, and promoting environmental stewardship.</li>
        <li><strong>Supportive Environments:</strong> Creating safe, welcoming, and well-designed social and physical spaces that encourage community connection and spontaneous activity.</li>
        <li><strong>Recreation Capacity:</strong> Building the skills, knowledge, leadership, and collaborative networks needed to plan, deliver, and sustain high-quality recreation programs and services.</li>
      </ol>

      <h3>How This Platform Aligns Your Project</h3>
       <p>
            By using this tool, you can generate a formal report that clearly articulates how your project—whether it's a series of dance workshops, a community mural, or a storytelling festival—achieves the goals of the Framework. This allows you to speak the language of recreation funders and demonstrate your project's value in terms they understand and prioritize.
        </p>
      <ol>
        <li>Navigate to the <strong>Recreation Framework (Canada)</strong> page from the <code>Tools</code> menu.</li>
        <li>Select the project you want to analyze.</li>
        <li>
          <strong>(Optional) Refine the AI's Instructions:</strong> In the "AI Instructions" tab, you can see and edit the detailed prompt the AI uses. For most users, the default is fine, but advanced users can tweak it to emphasize certain aspects of their project.
        </li>
        <li>Click "Generate Report".</li>
      </ol>
      <p>
        The AI will analyze your project data and produce a multi-section report that you can then save as a PDF or copy for use in your grant applications.
      </p>
      
      <h3>A Specialization in Recreation Capacity</h3>
      <p>
        While the AI tool can help articulate alignment with all five goals, the Arts Incubator platform as a whole is uniquely designed to help you <strong>document and prove Goal 5: Recreation Capacity</strong>. Building capacity is about more than just running a program; it's about having the systems, skills, and organizational structure to do it effectively and sustainably. This platform helps you build that evidence.
      </p>
      <h4>Examples of Demonstrating Capacity:</h4>
      <ul>
        <li><strong>Program Planning:</strong> By using the <code>Tasks</code> module to break down a large project like a "Community Lantern Festival" into specific, assigned tasks (e.g., 'Lead lantern-making workshop,' 'Secure park permit,' 'Organize volunteer schedule'), you are creating a detailed record of your program planning and execution capabilities.</li>
        <li><strong>Fiscal Management:</strong> When you link those tasks to your project's <code>Budget</code> and then track time against them, you are demonstrating robust financial management and the ability to deliver a recreation program on budget.</li>
        <li><strong>Leadership & Volunteer Development:</strong> Assigning <code>Members</code> to specific roles for an event (e.g., 'Lead Facilitator,' 'Youth Mentor,' 'Safety Marshal') provides concrete evidence of leadership development and volunteer management—key components of recreation capacity.</li>
      </ul>
      <p>
          In short, the platform doesn't just help you <em>say</em> your project builds capacity; it provides the data and documentation to <em>prove</em> it to funders.
      </p>

      <InfoBox type="tip">
        <p><strong>Case Study:</strong> A theatre group wants to apply for a municipal "Healthy Communities" grant. By running their "Improv for Seniors" project through this tool, they can generate a report that highlights how improv games promote <strong>Active Living</strong> (light physical movement), create <strong>Supportive Environments</strong>, and increase <strong>Access to Recreation</strong> for an underserved demographic. This reframing makes their application much stronger for that specific funding opportunity.</p>
      </InfoBox>
    </div>
  );
};

export default RecreationFrameworkGuide;