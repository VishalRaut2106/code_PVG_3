export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: August 16, 2025</p>

      <div className="prose prose-invert max-w-none">
        <p>
          Your privacy is important to us. This Privacy Policy explains what information we collect, how we use it,
          and your choices regarding your data when using CodePVG.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>Account information such as name, email, and role (student/admin)</li>
          <li>Usage data like pages visited, features used, and interaction logs</li>
          <li>Technical data including device, browser type, and IP address</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>Provide and improve our learning platform experience</li>
          <li>Personalize content and track your learning progress</li>
          <li>Maintain security, prevent abuse, and comply with legal requirements</li>
        </ul>

        <h2>Data Sharing</h2>
        <p>
          We do not sell your personal data. We may share limited data with trusted service providers to operate the
          platform (e.g., hosting, analytics) under strict confidentiality agreements.
        </p>

        <h2>Data Retention</h2>
        <p>
          We retain your data only for as long as necessary to provide our services and for legitimate business or legal
          purposes.
        </p>

        <h2>Your Rights</h2>
        <ul>
          <li>Access, correct, or delete your personal data</li>
          <li>Object to or restrict certain processing</li>
          <li>Export your data where applicable</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, contact us at
          <a href="mailto:atharva.rahate374@gmail.com" className="text-accent"> atharva.rahate374@gmail.com</a>.
        </p>
      </div>
    </div>
  )
}
