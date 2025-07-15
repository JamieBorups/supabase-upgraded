
import React from 'react';
import InfoBox from './InfoBox';

const ResearchApproachesGuide: React.FC = () => {
    return (
        <div>
            <h2>A Guide to Research Approaches</h2>
            <p>
                When you create a research plan, you are asked to select from various theoretical approaches. These selections are not just labels; they are instructions that guide the AI in generating text that aligns with specific principles and methodologies. This guide explains what each option means.
            </p>

            <h3>Epistemologies (Ways of Knowing)</h3>
            <p>Epistemology is the theory of knowledge—it's about *what* we consider to be valid knowledge and *how* we know it. Your choice here shapes the fundamental values of your research.</p>
            <ul>
                <li><strong>Indigenous Epistemologies:</strong> Select this if your research is grounded in Indigenous worldviews. The AI will emphasize knowledge systems rooted in relationships, reciprocity, and lived experience. It will prioritize community-led knowledge creation and respect for Indigenous data sovereignty.</li>
                <li><strong>Participatory/Experiential Epistemology:</strong> This approach values knowledge that comes from direct experience and collective reflection. The AI will describe methods where community members are not subjects, but active co-generators of knowledge.</li>
                <li><strong>Critical Epistemology:</strong> Use this to frame your research as a tool for social change. The AI will generate text that explains how your project aims to identify, challenge, and dismantle oppressive systems and power structures.</li>
                <li><strong>Post-Positivist Epistemology:</strong> This is a more traditional academic stance. It acknowledges that an objective reality exists but recognizes that our human understanding of it is always partial and interpretive.</li>
                <li><strong>Constructivist Epistemology:</strong> This view holds that knowledge is socially constructed. The AI will emphasize valuing subjective experiences and understanding the multiple, valid realities of participants.</li>
                <li><strong>Decolonial Epistemology:</strong> This approach actively works to dismantle the legacy of colonial knowledge systems. The AI will focus on centering marginalized voices, questioning dominant narratives, and promoting self-determination.</li>
            </ul>

            <h3>Pedagogies (Approaches to Learning & Sharing)</h3>
            <p>Pedagogy is the theory and practice of learning and teaching. Your choice here influences how knowledge is shared and created within your project.</p>
            <ul>
                <li><strong>Popular Education:</strong> Based on the work of Paulo Freire, this approach uses participatory activities to help people develop a critical consciousness about their own social reality and take collective action.</li>
                <li><strong>Experiential Learning:</strong> This focuses on "learning by doing." The AI will describe activities where community members gain new skills and insights through direct, hands-on participation.</li>
                <li><strong>Andragogy (Adult Learning Principles):</strong> Select this if your project primarily involves adults. The AI will describe learning activities that are self-directed, problem-centered, and respect the life experiences of adult learners.</li>
                <li><strong>Culturally Responsive Pedagogy:</strong> This ensures that learning activities are relevant and validating for participants from diverse cultural backgrounds. The AI will describe how methods are adapted to respect and incorporate different cultural norms and values.</li>
                <li><strong>Intergenerational Learning:</strong> This focuses on activities that bring different age groups together to share knowledge, stories, and skills, fostering strong community bonds.</li>
                <li><strong>Peer-to-Peer Learning:</strong> This outlines activities where participants learn from and teach each other, positioning everyone as both a teacher and a learner.</li>
            </ul>

            <h3>Methodologies (Overall Research Strategies)</h3>
            <p>Methodology is the overall strategy or blueprint for your research.</p>
            <ul>
                <li><strong>Participatory Action Research (PAR):</strong> This is a cyclical process where community members are co-researchers who identify a problem, take action to address it, and collectively reflect on the results to inform the next cycle.</li>
                <li><strong>Community-Based Participatory Research (CBPR):</strong> Similar to PAR, CBPR emphasizes long-term partnerships and shared power between researchers and community members throughout the entire research process, from question design to dissemination.</li>
                <li><strong>Indigenous Methodologies:</strong> This prioritizes research approaches rooted in Indigenous worldviews and protocols. The AI will emphasize methods that respect Indigenous sovereignty, governance, ethics (like OCAP® principles), and data ownership.</li>
                <li><strong>Case Study:</strong> This involves an in-depth, intensive exploration of a single "case"—be it a person, a group, an event, or a community—to understand a phenomenon in its real-world context.</li>
                <li><strong>Ethnography:</strong> This involves the researcher immersing themselves in a community or culture to understand their practices, beliefs, and social structures from an insider's perspective.</li>
                <li><strong>Oral History/Knowledge Transmission:</strong> This describes methods and ethical protocols for gathering, interpreting, and respectfully sharing sensitive stories, personal histories, and traditional knowledge.</li>
                <li><strong>Arts-Based Research:</strong> This uses creative processes (e.g., performance, painting, storytelling) as a primary way to conduct inquiry, analyze findings, and share results.</li>
                <li><strong>Design-Based Research (DBR):</strong> An approach often used in education, where researchers and practitioners collaborate to design, test, and iteratively refine interventions or educational materials in real-world settings.</li>
            </ul>
            
            <h3>Mixed-Methodological Approaches</h3>
            <p>Select one of these if your project intentionally combines both qualitative (e.g., interviews, stories) and quantitative (e.g., surveys, statistics) data.</p>
            <ul>
                <li><strong>Convergent Parallel Design:</strong> You collect both qualitative and quantitative data at the same time, analyze them separately, and then merge the results to get a more complete picture.</li>
                <li><strong>Explanatory Sequential Design:</strong> You start with quantitative data (e.g., a survey) and then use qualitative data (e.g., follow-up interviews) to help explain the statistical results in more depth.</li>
                <li><strong>Exploratory Sequential Design:</strong> You start with qualitative data (e.g., focus groups) to explore a topic, and then use the findings to build a quantitative tool (like a survey) for a larger sample.</li>
            </ul>
        </div>
    );
};

export default ResearchApproachesGuide;
