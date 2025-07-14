import React from 'react';
import InfoBox from './InfoBox';

const EcoStarGuide: React.FC = () => {
  return (
    <div>
      <h2>ECO-STAR AI Workshop</h2>
      <p>
        The <strong>ECO-STAR AI Workshop</strong> is a powerful strategic tool designed to help you analyze and articulate your project's value proposition in a clear, compelling, and holistic way. It adapts a framework often used in business and climate technology to the unique context of arts and culture projects.
      </p>
      <p>
        Using this tool will help you produce a narrative that is perfect for grant applications, partnership proposals, and strategic planning sessions, especially when you need to demonstrate your project's impact beyond the purely artistic.
      </p>
      
      <h3>How It Works</h3>
      <p>
        The workshop is located in the <code>Tools</code> menu. To begin, you select a project you want to analyze. The AI will then use all the information from that project (description, budget, collaborators, etc.) as context. You have two ways to work:
      </p>
      <ol>
        <li><strong>Chat-based Brainstorming:</strong> Select a section of the framework (like "Environment") and click "Chat". The AI will act as a coach, asking you probing questions to help you think more deeply about that aspect of your project.</li>
        <li><strong>Automated Report Generation:</strong> Click "Generate" for a section, and the AI will write a polished summary for you based on the project data. You can also click "Generate Full Report" to have the AI complete all sections at once.</li>
      </ol>
       <InfoBox type="tip">
        <p>You can generate a report for a section, copy the text, and then paste it into the chat with instructions like, "Can you rephrase this to be more focused on community engagement?" This iterative process allows you to refine the AI's output to perfectly match your needs.</p>
      </InfoBox>

      <h3>The ECO-STAR Framework Explained</h3>
      <p>Each letter in ECO-STAR represents a critical component of your project's story:</p>

      <h4>E – Environment</h4>
      <p>This is about the specific <strong>context, place, and time</strong> of your project. It's not just about the natural environment. Think about the social, cultural, political, and economic landscape your project exists within. What makes this place unique? What are the local challenges or opportunities? How does your project acknowledge and interact with its surroundings?</p>

      <h4>C – Customer</h4>
      <p>Who are you creating value for? In the arts, "customer" can be a tricky word. This framework encourages a broad definition that includes:</p>
      <ul>
        <li><strong>Audience:</strong> The people who will experience your work.</li>
        <li><strong>Participants:</strong> People actively involved in the creation (e.g., workshop attendees).</li>
        <li><strong>Community:</strong> The broader group that benefits from the project's presence.</li>
        <li><strong>Nature-Centered "Customers":</strong> You can even define a natural entity, like a river or a forest, as the customer your project serves.</li>
      </ul>

      <h4>O – Opportunity</h4>
      <p>Why is this project important <strong>right now</strong>? What makes this a unique moment to act? Consider changes in your community, new funding opportunities, a relevant social issue, or a new artistic discovery that makes your project timely and urgent.</p>

      <h4>S – Solution</h4>
      <p>This is the "what" of your project. What is the specific artistic offering? Is it a performance, an exhibition, a series of workshops, a digital creation? Describe the solution in detail and explain how it directly addresses the need or opportunity you've identified.</p>
      
      <h4>T – Team</h4>
      <p>Who is bringing this project to life, and why are they the right people for the job? This goes beyond listing names. Highlight the unique skills, lived experiences, community connections, and passion that your team possesses. If you are working with Elders or community leaders, explain the value of their knowledge.</p>

      <h4>A – Advantage</h4>
      <p>What makes your approach special, unique, or more effective than other possible solutions? This is your "secret sauce". It could be your unique artistic style, deep-rooted community trust, a novel use of technology, or a partnership that no one else has.</p>

      <h4>R – Results</h4>
      <p>What are the tangible and intangible outcomes you aim to achieve? Go beyond "we will create a play." Think about measurable results like:</p>
      <ul>
        <li>Number of participants or audience members.</li>
        <li>Shift in community perception (measured by surveys).</li>
        <li>Creation of a lasting community asset.</li>
        <li>Development of new skills in participants.</li>
      </ul>
    </div>
  );
};

export default EcoStarGuide;
