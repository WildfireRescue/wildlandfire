import { motion } from 'motion/react';
import { Scale, FileCheck, AlertCircle, UserX, DollarSign, Shield } from 'lucide-react';

export function TermsOfUsePage() {
  const sections = [
    {
      icon: FileCheck,
      title: 'Acceptance of Terms',
      content: [
        {
          subtitle: 'Agreement to Terms',
          text: 'By accessing and using the website of The Wildland Fire Recovery Fund (thewildlandfirerecoveryfund.org), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website or services.'
        },
        {
          subtitle: 'Changes to Terms',
          text: 'We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes are posted constitutes your acceptance of the modified terms.'
        }
      ]
    },
    {
      icon: Scale,
      title: 'Use of Website',
      content: [
        {
          subtitle: 'Permitted Use',
          text: 'You may use our website for lawful purposes only. You agree not to use our website in any way that violates any applicable local, state, national, or international law or regulation.'
        },
        {
          subtitle: 'Prohibited Activities',
          text: 'You may not: attempt to gain unauthorized access to our systems; transmit viruses or malicious code; interfere with the proper functioning of the website; use automated systems to access the website without permission; or collect information about other users without their consent.'
        },
        {
          subtitle: 'Account Security',
          text: 'If you create an account on our website, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
        }
      ]
    },
    {
      icon: DollarSign,
      title: 'Donations & Contributions',
      content: [
        {
          subtitle: 'Tax-Deductible Donations',
          text: 'The Wildland Fire Recovery Fund is a 501(c)(3) nonprofit organization. Donations made to our organization are tax-deductible to the extent allowed by law. We will provide receipts for all donations for your tax records.'
        },
        {
          subtitle: 'Donation Processing',
          text: 'All donations are processed through secure third-party payment processors. We do not store your complete credit card information on our servers. Donations are generally non-refundable, except in cases of duplicate charges or processing errors.'
        },
        {
          subtitle: 'Use of Funds',
          text: 'Donations will be used to support our mission of providing relief and recovery assistance to wildfire-affected communities. While we make every effort to honor donor preferences for specific programs, we reserve the right to redirect funds to areas of greatest need.'
        },
        {
          subtitle: 'Recurring Donations',
          text: 'If you set up a recurring donation, your payment method will be charged automatically at the frequency you selected. You may cancel recurring donations at any time by contacting us or through your donor account.'
        }
      ]
    },
    {
      icon: UserX,
      title: 'Grant Applications',
      content: [
        {
          subtitle: 'Eligibility & Review',
          text: 'Grant applications are subject to review and approval by The Wildland Fire Recovery Fund. We reserve the right to approve or deny any application at our sole discretion based on eligibility criteria, available funds, and organizational priorities.'
        },
        {
          subtitle: 'Truthful Information',
          text: 'Applicants must provide accurate and truthful information in all grant applications. Providing false or misleading information may result in denial of the application, termination of grant funding, and potential legal action.'
        },
        {
          subtitle: 'No Guarantee',
          text: 'Submission of a grant application does not guarantee approval or funding. The number of grants awarded and funding amounts are determined by available resources and organizational capacity.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Intellectual Property',
      content: [
        {
          subtitle: 'Copyright & Trademarks',
          text: 'All content on this website, including text, graphics, logos, images, and software, is the property of The Wildland Fire Recovery Fund or its content suppliers and is protected by copyright and trademark laws.'
        },
        {
          subtitle: 'Limited License',
          text: 'You are granted a limited, non-exclusive, non-transferable license to access and use our website for personal, non-commercial purposes. You may not reproduce, distribute, modify, or create derivative works from our content without express written permission.'
        },
        {
          subtitle: 'User-Generated Content',
          text: 'If you submit content to our website (such as testimonials, comments, or photos), you grant us a perpetual, worldwide, royalty-free license to use, reproduce, and display that content in connection with our mission and activities.'
        }
      ]
    },
    {
      icon: AlertCircle,
      title: 'Disclaimers & Limitations',
      content: [
        {
          subtitle: 'Website "As Is"',
          text: 'Our website and services are provided "as is" without warranties of any kind, either express or implied. We do not warrant that the website will be uninterrupted, error-free, or free from viruses or other harmful components.'
        },
        {
          subtitle: 'No Professional Advice',
          text: 'Information provided on our website is for general informational purposes only and should not be construed as legal, financial, or professional advice. Always consult with qualified professionals for specific guidance.'
        },
        {
          subtitle: 'External Links',
          text: 'Our website may contain links to third-party websites. We are not responsible for the content, privacy practices, or terms of use of external sites. These links are provided for your convenience only.'
        },
        {
          subtitle: 'Limitation of Liability',
          text: 'To the fullest extent permitted by law, The Wildland Fire Recovery Fund shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services, even if we have been advised of the possibility of such damages.'
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
              <Scale className="text-primary" size={40} />
            </motion.div>
            <p className="text-primary uppercase tracking-widest text-sm font-semibold mb-4">
              TERMS & CONDITIONS
            </p>
            <h1 className="text-5xl md:text-6xl mb-6">Terms of Use</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Please read these Terms of Use carefully before using our website. By accessing or using our services, 
              you agree to be bound by these terms.
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
              These Terms of Use govern your access to and use of The Wildland Fire Recovery Fund website and services. 
              By using our website, making a donation, or applying for assistance, you acknowledge that you have read, 
              understood, and agree to be bound by these terms and our Privacy Policy.
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

          {/* Indemnification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 p-8 rounded-2xl bg-card border border-border"
          >
            <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless The Wildland Fire Recovery Fund, its officers, 
              directors, employees, volunteers, and agents from any claims, damages, losses, liabilities, and 
              expenses (including legal fees) arising from your use of our website, violation of these Terms of Use, 
              or infringement of any third-party rights.
            </p>
          </motion.div>

          {/* Governing Law */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8 p-8 rounded-2xl bg-primary/5 border border-primary/20"
          >
            <h2 className="text-2xl font-semibold mb-4">Governing Law & Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These Terms of Use are governed by and construed in accordance with the laws of the State of Idaho, 
              without regard to its conflict of law provisions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Any disputes arising from these terms or your use of our website shall be resolved through good faith 
              negotiation. If a resolution cannot be reached, disputes may be subject to binding arbitration or 
              litigation in courts located in Canyon County, Idaho.
            </p>
          </motion.div>

          {/* Severability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-8 p-8 rounded-2xl bg-card border border-border"
          >
            <h2 className="text-2xl font-semibold mb-4">Severability & Entire Agreement</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If any provision of these Terms of Use is found to be unenforceable or invalid, that provision shall be 
              limited or eliminated to the minimum extent necessary so that the remaining terms remain in full force 
              and effect.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Use, together with our Privacy Policy, constitute the entire agreement between you and 
              The Wildland Fire Recovery Fund regarding your use of our website and services.
            </p>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-12 p-10 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center"
          >
            <h2 className="text-3xl font-semibold mb-4">Questions About These Terms?</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              If you have any questions or concerns about these Terms of Use, please contact us. 
              We're here to help clarify anything you need.
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
