import React from 'react';

const AcknowledgementsGuide: React.FC = () => {
  return (
    <div>
      <h2>Acknowledgements</h2>
      <p>
        The development of this Arts Incubator platform was made possible through visionary support and foundational research from several key partners. We extend our deepest gratitude to them for their belief in the power of technology to empower artists.
      </p>

      <h3>Core Technology & Research Partners</h3>
      <ul>
        <li>
          <strong>Canada Council for the Arts Digital Greenhouse:</strong> For their pioneering research into digital innovation in the arts, which provided the strategic groundwork and inspiration for this project.
        </li>
        <li>
          <strong>OpenAI Researcher Access Program:</strong> For their early-stage support, which was instrumental in exploring and integrating the powerful AI co-pilot features that are central to the platform's mission.
        </li>
        <li>
          <strong>Google for Developers:</strong> For providing the robust and scalable Gemini API, which powers the advanced AI capabilities of the application.
        </li>
      </ul>

      <h3>Community & Knowledge Keepers</h3>
      <p>
        We also wish to thank the many northern and Indigenous artists, administrators, and community members who have shared their knowledge, experience, and challenges. Your insights are woven into the very fabric of this tool, ensuring it is built for and by the communities it is intended to serve.
      </p>
    </div>
  );
};

export default AcknowledgementsGuide;
