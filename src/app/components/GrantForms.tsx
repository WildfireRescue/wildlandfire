import { motion } from 'motion/react';
import { GraduationCap, Flame, CheckCircle, Clock, Send, Home, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

export function GrantForms() {
  const [educationFormData, setEducationFormData] = useState({
    name: '',
    email: '',
    phone: '',
    affectedBy: '',
    education: '',
    message: ''
  });

  const [fireDeptFormData, setFireDeptFormData] = useState({
    deptName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    requestType: '',
    amount: '',
    description: ''
  });

  const handleEducationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your interest! Education grants are currently closed. We will notify you when applications reopen.');
  };

  const handleFireDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your application! We will review your request and contact you as soon as possible.');
  };

  return (
    <section className="py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Individual Relief - NO APPLICATION NEEDED */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-blue-500/5 to-blue-400/5 border-2 border-blue-500/30 rounded-3xl p-8 relative overflow-hidden"
          >
            {/* Active Badge - Top Position */}
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-6 py-1.5 text-xs font-bold shadow-lg rounded-full">
              PROACTIVE
            </div>

            <div className="flex items-center gap-4 mb-6 mt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-400/20 flex items-center justify-center">
                <Home className="text-blue-400" size={32} />
              </div>
              <div>
                <h2 className="text-3xl mb-1">Individual Relief</h2>
                <p className="text-muted-foreground">For wildfire survivors</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-blue-400 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-blue-400 mb-1">No Application Required</p>
                  <p className="text-sm text-muted-foreground">
                    If you've lost your home to wildfire, help is already on the way. We deploy to major fires—finding survivors and delivering immediate relief.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-6">
              <div>
                <h3 className="font-semibold text-lg mb-4 text-center">How We Deploy Aid</h3>
                <div className="space-y-4">
                  <div className="bg-card/50 border border-border rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-blue-400">1</span>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">We Respond</p>
                        <p className="text-sm text-muted-foreground">Our team deploys to major wildfire scenes within our coverage area—no application needed</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 border border-border rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-blue-400">2</span>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">We Assess</p>
                        <p className="text-sm text-muted-foreground">We work directly with survivors on-site to understand immediate needs and long-term support</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 border border-border rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-blue-400">3</span>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">We Deliver</p>
                        <p className="text-sm text-muted-foreground">Emergency funds, housing assistance, and ongoing support arrive rapidly</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/20 to-blue-400/20 border border-blue-500/30 rounded-xl p-4">
                <p className="text-sm text-muted-foreground text-center">
                  <strong className="text-foreground">Your donations power this rapid response.</strong> Every dollar you give helps us expand our coverage area, hire more field responders, and reach more families in their darkest hour.
                </p>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
            >
              <a href="#donate">
                <Home size={20} className="mr-2" />
                Support Individual Relief
              </a>
            </Button>
          </motion.div>

          {/* Education Grants - CLOSED */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card border-2 border-border rounded-3xl p-8 relative overflow-hidden"
          >
            {/* Closed Banner - Top Position */}
            <div className="absolute top-4 right-4 bg-red-500 text-white px-6 py-1.5 text-xs font-bold shadow-lg rounded-full">
              CLOSED
            </div>

            <div className="flex items-center gap-4 mb-6 mt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <GraduationCap className="text-purple-400" size={32} />
              </div>
              <div>
                <h2 className="text-3xl mb-1">Education Grants</h2>
                <p className="text-muted-foreground">For students affected by wildfires</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <Clock className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-red-400 mb-1">Applications Currently Closed</p>
                  <p className="text-sm text-muted-foreground">
                    Education grant applications are not open at this time. Please check back later for updates on when applications will reopen.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6 opacity-50">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold mb-1">College Tuition Support</p>
                  <p className="text-sm text-muted-foreground">Financial assistance for students pursuing higher education after losing their homes to wildfires</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold mb-1">Trade School Funding</p>
                  <p className="text-sm text-muted-foreground">Support for vocational training programs to help rebuild careers and futures</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold mb-1">Educational Materials</p>
                  <p className="text-sm text-muted-foreground">Replacement laptops, books, and supplies lost in fires</p>
                </div>
              </div>
            </div>

            {/* Interest Form (Even when closed) */}
            <form onSubmit={handleEducationSubmit} className="space-y-4 opacity-75">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                  value={educationFormData.name}
                  onChange={(e) => setEducationFormData({...educationFormData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your.email@example.com"
                  value={educationFormData.email}
                  onChange={(e) => setEducationFormData({...educationFormData, email: e.target.value})}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled
                className="w-full bg-secondary text-muted-foreground cursor-not-allowed"
              >
                <Clock size={20} className="mr-2" />
                Currently Closed - Check Back Later
              </Button>
            </form>
          </motion.div>

          {/* Fire Department Grants - ACTIVE */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-primary/5 to-orange-500/5 border-2 border-primary/30 rounded-3xl p-8 relative overflow-hidden"
          >
            {/* Active Badge - Top Position */}
            <div className="absolute top-4 right-4 bg-green-500 text-white px-6 py-1.5 text-xs font-bold shadow-lg rounded-full">
              ACTIVE
            </div>

            <div className="flex items-center gap-4 mb-6 mt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center">
                <Flame className="text-primary" size={32} />
              </div>
              <div>
                <h2 className="text-3xl mb-1">Fire Department Grants</h2>
                <p className="text-muted-foreground">Supporting those who serve</p>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-green-400 mb-1">Now Accepting Applications</p>
                  <p className="text-sm text-muted-foreground">
                    Submit your application below and we will review your request.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold mb-1">Mental Health Counseling</p>
                  <p className="text-sm text-muted-foreground">Trauma counseling and mental health support for firefighters and their families</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold mb-1">Equipment Replacement</p>
                  <p className="text-sm text-muted-foreground">Funding to replace damaged or worn equipment from wildfire response</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold mb-1">Training & Resources</p>
                  <p className="text-sm text-muted-foreground">Support for specialized wildfire training and resource development</p>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleFireDeptSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fire Department Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="City Fire Department"
                    value={fireDeptFormData.deptName}
                    onChange={(e) => setFireDeptFormData({...fireDeptFormData, deptName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Chief John Smith"
                    value={fireDeptFormData.contactName}
                    onChange={(e) => setFireDeptFormData({...fireDeptFormData, contactName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="contact@firedept.org"
                    value={fireDeptFormData.email}
                    onChange={(e) => setFireDeptFormData({...fireDeptFormData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="(555) 123-4567"
                    value={fireDeptFormData.phone}
                    onChange={(e) => setFireDeptFormData({...fireDeptFormData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Department Address *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="123 Main St, City, State ZIP"
                  value={fireDeptFormData.address}
                  onChange={(e) => setFireDeptFormData({...fireDeptFormData, address: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Grant Type *</label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    value={fireDeptFormData.requestType}
                    onChange={(e) => setFireDeptFormData({...fireDeptFormData, requestType: e.target.value})}
                  >
                    <option value="">Select a grant type</option>
                    <option value="counseling">Mental Health Counseling</option>
                    <option value="equipment">Equipment Replacement</option>
                    <option value="training">Training & Resources</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Requested Amount *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="$10,000"
                    value={fireDeptFormData.amount}
                    onChange={(e) => setFireDeptFormData({...fireDeptFormData, amount: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Grant Description *</label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Please describe your grant request in detail. Include what you need, why you need it, how it will be used, and who it will benefit. Be specific about equipment, training programs, or counseling services."
                  value={fireDeptFormData.description}
                  onChange={(e) => setFireDeptFormData({...fireDeptFormData, description: e.target.value})}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send size={20} className="mr-2" />
                Submit Grant Application
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting this application, you certify that all information is accurate and complete.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}