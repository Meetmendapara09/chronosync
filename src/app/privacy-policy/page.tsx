
import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - ChronoSync',
  description: 'Read the Privacy Policy for ChronoSync.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <header className="mb-10 text-center">
        <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Privacy Policy for ChronoSync
        </h1>
        <p className="mt-2 text-muted-foreground">
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <article className="prose dark:prose-invert max-w-none text-foreground/90">
        <p>
          Welcome to ChronoSync! This Privacy Policy explains how we handle your information.
          Our goal is to provide useful time management tools while respecting your privacy.
          <br></br>
          <strong> ChronoSync is designed to be a privacy-first application.</strong>
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-foreground">1. Information We Do Not Collect</h2>
        <p>
          ChronoSync, in its current version, does not require user accounts and operates primarily as a client-side application.
          We generally do not collect or store personally identifiable information (PII) on our servers.
        </p>
        <ul>
          <li><strong>No User Accounts:</strong> You can use ChronoSync without creating an account.</li>
          <li><strong>Event Scheduler Data:</strong> For features like the Event Scheduler, event details (name, time, original timezone) are encoded directly into the shareable link you generate. This data is not transmitted to or stored on ChronoSync's servers. The privacy of this link is your responsibility.</li>
          <li><strong>Local Storage:</strong> Some features might use your browser's local storage to remember your preferences (e.g., selected timezones for the World Clock). This data is stored on your device and is not accessed by us.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-foreground">2. Information Collected Automatically (Non-Personal)</h2>
        <p>
          Like most websites, our hosting provider (e.g., Vercel) may collect standard web server logs. This may include:
        </p>
        <ul>
          <li>Your IP address (often anonymized or generalized)</li>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>Date and time of access</li>
          <li>Pages visited</li>
          <li>Referring website</li>
        </ul>
        <p>
          This information is used for statistical purposes, to maintain the security and functionality of the service, and is typically not personally identifiable. We do not currently use third-party analytics services like Google Analytics.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-foreground">3. How We Use Information</h2>
        <p>
          Since we collect minimal information:
        </p>
        <ul>
          <li>Non-personal information (server logs) is used for site administration, troubleshooting, and understanding usage patterns to improve ChronoSync.</li>
          <li>Data stored in your browser's local storage is used solely to enhance your user experience within the application (e.g., remembering your settings).</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-foreground">4. Data Sharing and Disclosure</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties because we generally do not collect it.
        </p>
        <p>
          We may disclose aggregated, non-personally identifiable information for analytical purposes or if required by law.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-3 text-foreground">5. Data Security</h2>
        <p>
          While ChronoSync itself does not store your personal data on servers, we use reputable hosting providers that implement standard security measures to protect their infrastructure.
          For data stored locally in your browser, the security depends on your browser and device security.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-foreground">6. Third-Party Libraries and Services</h2>
        <p>
          ChronoSync utilizes various open-source JavaScript libraries for its functionality (e.g., Luxon for date/time, Leaflet for maps, etc.). These libraries operate within your browser. We are not responsible for the privacy practices of these third-party libraries.
        </p>
        <p>
          The application is open-source. You can inspect the code to understand how data is handled. The repository is available at: <a href="https://github.com/MeetMendapara09/chronosync" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://github.com/MeetMendapara09/chronosync</a>
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-foreground">7. Children's Privacy</h2>
        <p>
          ChronoSync is not intended for use by children under the age of 13. We do not knowingly collect any personal information from children.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-foreground">8. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this PrivacyPolicy periodically for any changes.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-foreground">9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <ul>
        <li>
  By email: <a href="mailto:meetmendapara09@gmail.com">meetmendapara09@gmail.com</a>
</li>
        </ul>

      </article>
    </div>
  );
}
