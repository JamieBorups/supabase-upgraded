
import React from 'react';

const ResearchApproachDescriptions: React.FC = () => {
    return (
        <details className="p-4 border border-slate-300 rounded-lg bg-slate-50">
            <summary className="text-lg font-bold text-slate-800 cursor-pointer">View Research Approach Descriptions</summary>
            <div className="mt-4 prose prose-sm max-w-none text-slate-700">
                <p>This is a reference guide explaining the different research approaches you can select when creating a research plan. The AI will use your selections to tailor its generated content.</p>

                <h4>Epistemologies (Ways of Knowing)</h4>
                <ul>
                    <li><strong>Indigenous Epistemologies:</strong> Emphasizes knowledge systems rooted in Indigenous experiences, worldviews, and relationships. Highlights principles like relationality and reciprocity. Ensures the plan clearly states how Indigenous knowledge holders will lead or co-lead knowledge creation.</li>
                    <li><strong>Participatory/Experiential Epistemology:</strong> Focuses on knowledge derived from direct experience and collective reflection. Ensures the plan describes how participants are active knowledge generators.</li>
                    <li><strong>Critical Epistemology:</strong> The plan should explain how the research aims to challenge oppressive systems and power structures.</li>
                    <li><strong>Post-Positivist Epistemology:</strong> Acknowledges an objective reality but recognizes that our understanding is always interpretive and imperfect.</li>
                    <li><strong>Constructivist Epistemology:</strong> Focuses on knowledge as socially constructed, valuing subjective experiences and multiple realities.</li>
                    <li><strong>Decolonial Epistemology:</strong> Emphasizes dismantling colonial knowledge frameworks and centering marginalized voices and ways of knowing.</li>
                </ul>

                <h4>Pedagogies (Approaches to Learning)</h4>
                <ul>
                    <li><strong>Popular Education:</strong> Describes activities that foster critical consciousness and collective action among participants.</li>
                    <li><strong>Experiential Learning:</strong> Outlines activities where community members learn and gain skills through direct participation and hands-on work.</li>
                    <li><strong>Andragogy (Adult Learning Principles):</strong> Describes learning activities designed for adults that respect their experiences and autonomy.</li>
                    <li><strong>Culturally Responsive Pedagogy:</strong> Explains how learning activities are adapted to be culturally relevant and validating for all participants.</li>
                    <li><strong>Intergenerational Learning:</strong> Describes activities that foster knowledge sharing and relationship building between different age groups.</li>
                    <li><strong>Peer-to-Peer Learning:</strong> Outlines activities that facilitate mutual skill development and knowledge sharing among peers.</li>
                </ul>

                <h4>Methodologies (Research Strategies)</h4>
                <ul>
                    <li><strong>Participatory Action Research (PAR):</strong> Details iterative cycles of action and reflection where community members act as co-researchers to address a community-defined problem.</li>
                    <li><strong>Community-Based Participatory Research (CBPR):</strong> Emphasizes long-term partnerships and shared power between researchers and community members in all phases of the research.</li>
                    <li><strong>Indigenous Methodologies:</strong> Prioritizes approaches rooted in Indigenous worldviews and protocols, ensuring research practices respect Indigenous sovereignty, governance, and data ownership.</li>
                    <li><strong>Case Study:</strong> Focuses on an in-depth, intensive exploration of a single case or phenomenon within its real-world context.</li>
                    <li><strong>Ethnography:</strong> Emphasizes immersive engagement within a community or culture to understand their practices, beliefs, and social structures from an insider's perspective.</li>
                    <li><strong>Oral History/Knowledge Transmission:</strong> Describes ethical protocols for gathering, interpreting, and sharing sensitive stories and traditional knowledge with respect and care.</li>
                    <li><strong>Arts-Based Research:</strong> Emphasizes creative processes (e.g., performance, visual art, storytelling) as methods for inquiry, analysis, and dissemination.</li>
                    <li><strong>Design-Based Research (DBR):</strong> Describes collaborative and iterative processes of designing, testing, and refining interventions or educational materials in real-world settings.</li>
                </ul>
                
                <h4>Mixed-Methodological Approaches</h4>
                <ul>
                    <li><strong>Convergent Parallel Design:</strong> Describes concurrent collection of both qualitative and quantitative data, which are then analyzed separately and their results merged for interpretation.</li>
                    <li><strong>Explanatory Sequential Design:</strong> Describes collecting and analyzing quantitative data first, then using the results to inform a subsequent qualitative data collection phase to explain the quantitative findings in more depth.</li>
                    <li><strong>Exploratory Sequential Design:</strong> Describes collecting and analyzing qualitative data first to explore a topic, then using the findings to build a quantitative instrument or phase of the study.</li>
                    <li><strong>Embedded Design:</strong> Describes a design where one data type (e.g., qualitative interviews) is nested within a larger, primarily different design (e.g., a quantitative survey) to provide supplemental insights.</li>
                    <li><strong>Transformative Design:</strong> Explains how the entire mixed methods process is guided by a specific theoretical lens (e.g., critical theory, social justice) to challenge existing power structures and advocate for change.</li>
                </ul>
            </div>
        </details>
    );
};

export default ResearchApproachDescriptions;
