
import React from 'react';
import InfoBox from './InfoBox';

const EnvVar: React.FC<{name: string}> = ({ name }) => (
    <code className="bg-slate-200 text-slate-800 font-mono py-0.5 px-1.5 rounded-md text-sm">{name}</code>
)

const SetupGuide: React.FC = () => {
  return (
    <div>
      <h2>Initial Setup: Getting Your Workspace Ready</h2>
      <p>
        Welcome to The Arts Incubator! Before you can start managing your projects, the application needs to be connected to its backend services. This involves setting three critical "environment variables" in the platform where you are hosting the application.
      </p>
      
      <h3>The Setup Wizard</h3>
      <p>
        If you launch the application and are greeted by a "Configuration Required" screen (the Setup Wizard), it means one or more of these environment variables are missing. This is expected behavior for a first-time setup. Once you have correctly configured the variables and redeployed your application, this screen will disappear, and you'll see the normal login page.
      </p>

      <h3>Required Environment Variables</h3>
      <p>
        The application requires three keys to connect to its database and AI services. You must add these to your hosting provider's settings (e.g., Vercel, Netlify, Docker).
      </p>

      <h4>1. Supabase Credentials (Database)</h4>
      <p>
        Supabase is used as the backend database to securely store all of your project data. You will need two keys from your Supabase project. If you don't have one, you can create a free project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>.
      </p>
      <ol>
        <li>Go to your Supabase project dashboard.</li>
        <li>In the left sidebar, find and click the <strong>Settings</strong> icon (a gear).</li>
        <li>In the settings menu, click on <strong>API</strong>.</li>
        <li>
          You will see a section called <strong>Project API Keys</strong>. You need two pieces of information from this page:
          <ul>
            <li>The <strong>Project URL</strong>. Copy this value.</li>
            <li>The <strong>public `anon` key</strong>. It's important to use this specific key. Copy this value.</li>
          </ul>
        </li>
        <li>
          Now, set the following environment variables in your hosting platform:
          <ul>
            <li><EnvVar name="SUPABASE_URL" />: Paste the Project URL you copied.</li>
            <li><EnvVar name="SUPABASE_ANON_KEY" />: Paste the `anon` public key you copied.</li>
          </ul>
        </li>
      </ol>
      <InfoBox type="warning">
        <p><strong>Use the 'anon' key only.</strong> Never expose your 'service_role' key or any other private key in a frontend application's environment variables, as this would be a major security risk.</p>
      </InfoBox>

      <h4>2. Google Gemini API Key (AI Features)</h4>
      <p>
        The platform's powerful AI features are powered by Google's Gemini models. To enable these, you need an API key.
      </p>
      <ol>
        <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.</li>
        <li>Log in with your Google account.</li>
        <li>Click the "Create API key" button to generate a new key.</li>
        <li>Copy the generated API key.</li>
        <li>
          Set the following environment variable in your hosting platform:
          <ul>
            <li><EnvVar name="API_KEY" />: Your generated Google API key.</li>
          </ul>
        </li>
      </ol>
      
      <h3>How to Set Environment Variables</h3>
      <p>
          The method for setting these variables depends entirely on your hosting provider. Here are some common examples:
      </p>
       <ul>
          <li><strong>Vercel:</strong> Go to your Project dashboard &gt; Settings &gt; Environment Variables.</li>
          <li><strong>Netlify:</strong> Go to your Site dashboard &gt; Site configuration &gt; Environment variables.</li>
          <li><strong>Docker:</strong> Use a <code className="text-sm">.env</code> file or pass variables via the command line when running the container.</li>
       </ul>
       <p>
          <strong>Crucially, after setting the variables, you must redeploy your application</strong> for the changes to take effect.
       </p>

      <h3>Completing Setup</h3>
      <p>
        Once all three environment variables are correctly set and your application has been redeployed, refresh the application page. The Setup Wizard will disappear, and you will be presented with the login screen. You can then log in with the default administrator account (username: <strong>admin</strong>, password: <strong>admin</strong>) to begin using the application.
      </p>
    </div>
  );
};

export default SetupGuide;
