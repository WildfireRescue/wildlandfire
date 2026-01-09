import { motion } from 'motion/react';
import { Shield, Eye, Lock, UserCheck, FileText, Globe } from 'lucide-react';

export function PrivacyPolicyPage() {
  const sections = [
    {
      icon: FileText,
      title: 'Information We Collect',
      content: [
        {
          subtitle: 'Personal Information',
          text: 'When you make a donation, apply for a grant, or contact us, we may collect personal information such as your name, email address, mailing address, phone number, and payment information. This information is used solely to process your requests and communicate with you.'
        },
        {
          subtitle: 'Automatically Collected Information',
          text: 'We may automatically collect certain information about your device and how you interact with our website, including IP address, browser type, pages visited, and the time and date of your visit. This helps us improve our website and user experience.'
        }
      ]
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: [
        {
          subtitle: 'Processing Donations & Grants',
          text: 'We use your information to process donations, administer grant applications, send receipts, and provide updates about our programs and impact.'
        },
        {
          subtitle: 'Communications',
          text: 'With your consent, we may send you newsletters, fundraising appeals, and updates about our work. You can opt out of these communications at any time.'
        },
        {
          subtitle: 'Legal Compliance',
          text: 'We may use your information to comply with legal obligations, including tax reporting requirements for charitable contributions.'
        }
      ]
    },
    {
      icon: UserCheck,
      title: 'Information Sharing & Disclosure',
      content: [
        {
          subtitle: 'Third-Party Service Providers',
          text: 'We work with trusted third-party service providers (such as payment processors and email service providers) who help us operate our website and conduct our mission. These providers are contractually obligated to keep your information secure and confidential.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose your information if required by law, court order, or other legal process, or to protect the rights, property, or safety of our organization and others.'
        },
        {
          subtitle: 'No Sale of Information',
          text: 'We never sell, trade, or rent your personal information to third parties for marketing purposes.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Data Security',
      content: [
        {
          subtitle: 'Protection Measures',
          text: 'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.'
        },
        {
          subtitle: 'Payment Security',
          text: 'All payment transactions are processed through secure, PCI-compliant payment processors. We do not store credit card information on our servers.'
        }
      ]
    },
    {
      icon: Eye,
      title: 'Your Rights & Choices',
      content: [
        {
          subtitle: 'Access & Correction',
          text: 'You have the right to access, correct, or update your personal information. Contact us at info@thewildlandfirerecoveryfund.org to make such requests.'
        },
        {
          subtitle: 'Opt-Out',
          text: 'You can opt out of receiving promotional communications from us by following the unsubscribe instructions in our emails or contacting us directly.'
        },
        {
          subtitle: 'Data Deletion',
          text: 'You may request deletion of your personal information, subject to our legal obligations to retain certain records for tax and regulatory purposes.'
        }
      ]
    },
    {
      icon: Globe,
      title: 'Cookies & Tracking Technologies',
      content: [
        {
          subtitle: 'Use of Cookies',
          text: 'Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand user behavior. You can control cookie preferences through your browser settings.'
        },
        {
          subtitle: 'Analytics',
          text: 'We use web analytics services to help us understand how visitors use our website. These services may collect information about your use of our site and other websites.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6"
            >
              <Shield className="text-primary" size={40} />
            </motion.div>
            <p className="text-primary uppercase tracking-widest text-sm font-semibold mb-4">
              YOUR PRIVACY MATTERS
            </p>
            <h1 className="text-5xl md:text-6xl mb-6">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The Wildland Fire Recovery Fund is committed to protecting your privacy and personal information. 
              This policy explains how we collect, use, and safeguard your data.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12 p-8 rounded-2xl bg-card border border-border"
          >
            <p className="text-lg leading-relaxed text-muted-foreground">
              At The Wildland Fire Recovery Fund, we respect your privacy and are committed to protecting your personal 
              information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information 
              when you visit our website, make a donation, or interact with our services.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="text-primary" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((item, idx) => (
                      <div key={idx} className="ml-16">
                        <h3 className="text-lg font-semibold mb-2 text-foreground">
                          {item.subtitle}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Children's Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 p-8 rounded-2xl bg-primary/5 border border-primary/20"
          >
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website and services are not directed to children under the age of 13. We do not knowingly 
              collect personal information from children under 13. If you are a parent or guardian and believe 
              your child has provided us with personal information, please contact us immediately.
            </p>
          </motion.div>

          {/* Changes to Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8 p-8 rounded-2xl bg-card border border-border"
          >
            <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for 
              legal, operational, or regulatory reasons. We will notify you of any material changes by posting 
              the updated policy on our website with a new "Last Updated" date.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We encourage you to review this Privacy Policy periodically to stay informed about how we are 
              protecting your information.
            </p>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-12 p-10 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center"
          >
            <h2 className="text-3xl font-semibold mb-4">Questions About Privacy?</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              If you have questions or concerns about this Privacy Policy or our data practices, 
              please don't hesitate to reach out.
            </p>
            <div className="space-y-2">
              <p className="text-lg">
                <strong>Email:</strong>{' '}
                <a 
                  href="mailto:info@thewildlandfirerecoveryfund.org" 
                  className="text-primary hover:underline"
                >
                  info@thewildlandfirerecoveryfund.org
                </a>
              </p>
              <p className="text-muted-foreground">
                The Wildland Fire Recovery Fund<br />
                Caldwell, Idaho<br />
                501(c)(3) Nonprofit Organization
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
