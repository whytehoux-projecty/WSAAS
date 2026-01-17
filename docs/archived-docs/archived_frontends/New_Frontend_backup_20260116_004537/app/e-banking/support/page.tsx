'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import {
    HelpCircle,
    MessageCircle,
    Phone,
    Mail,
    Clock,
    Search,
    ChevronDown,
    ChevronUp,
    Send
} from 'lucide-react';

const faqs = [
    {
        id: 1,
        category: 'Account',
        question: 'How do I reset my password?',
        answer: 'You can reset your password by clicking "Forgot Password" on the login page. Follow the instructions sent to your registered email address.',
    },
    {
        id: 2,
        category: 'Transfers',
        question: 'How long do transfers take?',
        answer: 'Internal transfers between AURUM VAULT accounts are instant. External transfers typically take 1-3 business days.',
    },
    {
        id: 3,
        category: 'Cards',
        question: 'What should I do if my card is lost or stolen?',
        answer: 'Immediately freeze your card through the Cards page or call our 24/7 support line at 1-800-AURUM-VAULT. We\'ll help you secure your account and order a replacement card.',
    },
    {
        id: 4,
        category: 'Security',
        question: 'How do I enable two-factor authentication?',
        answer: 'Go to Settings > Security and toggle on Two-Factor Authentication. You\'ll receive a verification code via SMS or email for each login.',
    },
    {
        id: 5,
        category: 'Bills',
        question: 'Can I schedule recurring bill payments?',
        answer: 'Yes! When adding a biller, you can enable AutoPay to automatically pay bills on their due date each month.',
    },
    {
        id: 6,
        category: 'Account',
        question: 'How do I update my contact information?',
        answer: 'Navigate to Settings > Profile to update your email, phone number, and address information.',
    },
    {
        id: 7,
        category: 'Statements',
        question: 'How can I download my account statements?',
        answer: 'Go to the Statements page, select the statement you need, and click the Download button. Statements are available in PDF format.',
    },
    {
        id: 8,
        category: 'Transfers',
        question: 'Are there any fees for transfers?',
        answer: 'Transfers between AURUM VAULT accounts are free. External transfers may incur a small fee depending on the destination bank.',
    },
];

const contactMethods = [
    {
        id: 1,
        icon: <Phone className="w-6 h-6" />,
        title: 'Phone Support',
        description: '24/7 customer service',
        contact: '1-800-AURUM-VAULT',
        action: 'Call Now',
    },
    {
        id: 2,
        icon: <Mail className="w-6 h-6" />,
        title: 'Email Support',
        description: 'Response within 24 hours',
        contact: 'support@aurumvault.com',
        action: 'Send Email',
    },
    {
        id: 3,
        icon: <MessageCircle className="w-6 h-6" />,
        title: 'Live Chat',
        description: 'Available Mon-Fri 9AM-6PM',
        contact: 'Start a conversation',
        action: 'Start Chat',
    },
];

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [contactForm, setContactForm] = useState({
        subject: '',
        category: '',
        message: '',
    });

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmitContact = () => {
        if (!contactForm.subject || !contactForm.category || !contactForm.message) {
            alert('Please fill in all fields');
            return;
        }
        alert('Your message has been sent! We\'ll respond within 24 hours.');
        setContactForm({ subject: '', category: '', message: '' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">How Can We Help?</h1>
                <p className="text-lg text-charcoal-light">Find answers or get in touch with our support team</p>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-6">
                    <Input
                        type="text"
                        placeholder="Search for help..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="w-5 h-5" />}
                    />
                </CardContent>
            </Card>

            {/* Contact Methods */}
            <div className="grid md:grid-cols-3 gap-4">
                {contactMethods.map((method) => (
                    <Card key={method.id} className="hover:shadow-vintage-lg transition-all">
                        <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-vintage-green/10 flex items-center justify-center text-vintage-green mb-4">
                                {method.icon}
                            </div>
                            <h3 className="font-semibold text-charcoal mb-1">{method.title}</h3>
                            <p className="text-sm text-charcoal-light mb-3">{method.description}</p>
                            <p className="text-sm font-semibold text-charcoal mb-4">{method.contact}</p>
                            <Button variant="outline" size="small" className="w-full">
                                {method.action}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* FAQs */}
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                        {searchQuery ? `${filteredFaqs.length} result${filteredFaqs.length !== 1 ? 's' : ''} found` : 'Common questions and answers'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredFaqs.length === 0 ? (
                        <div className="p-12 text-center">
                            <HelpCircle className="w-12 h-12 text-charcoal-light mx-auto mb-4" />
                            <p className="text-charcoal-light">No FAQs found matching your search</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-faded-gray-light">
                            {filteredFaqs.map((faq) => (
                                <div key={faq.id} className="p-4">
                                    <button
                                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                        className="w-full flex items-center justify-between text-left hover:bg-parchment p-2 rounded-lg transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-vintage-green/10 text-vintage-green text-xs rounded-full font-semibold">
                                                    {faq.category}
                                                </span>
                                            </div>
                                            <p className="font-semibold text-charcoal">{faq.question}</p>
                                        </div>
                                        {expandedFaq === faq.id ? (
                                            <ChevronUp className="w-5 h-5 text-charcoal-light flex-shrink-0 ml-4" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-charcoal-light flex-shrink-0 ml-4" />
                                        )}
                                    </button>
                                    {expandedFaq === faq.id && (
                                        <div className="mt-3 pl-2 pr-8">
                                            <p className="text-charcoal-light">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Send Us a Message</CardTitle>
                    <CardDescription>Can't find what you're looking for? Contact us directly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        label="Subject"
                        type="text"
                        placeholder="Brief description of your issue"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">Category</label>
                        <select
                            value={contactForm.category}
                            onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors"
                        >
                            <option value="">Select a category</option>
                            <option value="account">Account Issues</option>
                            <option value="transfers">Transfers</option>
                            <option value="cards">Cards</option>
                            <option value="bills">Bill Payments</option>
                            <option value="security">Security</option>
                            <option value="technical">Technical Support</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">Message</label>
                        <textarea
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            placeholder="Describe your issue in detail..."
                            className="w-full px-4 py-3 rounded-lg border-2 border-faded-gray-light focus:border-vintage-green focus:outline-none transition-colors resize-none"
                            rows={6}
                        />
                    </div>
                    <Button
                        variant="primary"
                        size="large"
                        icon={<Send className="w-5 h-5" />}
                        onClick={handleSubmitContact}
                        className="w-full"
                    >
                        Send Message
                    </Button>
                </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="bg-gradient-to-br from-parchment to-warm-cream border-vintage-green/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-vintage-green/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-6 h-6 text-vintage-green" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-charcoal mb-2">Support Hours</h3>
                            <div className="space-y-1 text-sm text-charcoal-light">
                                <p><strong className="text-charcoal">Phone Support:</strong> 24/7 (Every day)</p>
                                <p><strong className="text-charcoal">Live Chat:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                                <p><strong className="text-charcoal">Email Support:</strong> 24/7 (Response within 24 hours)</p>
                            </div>
                            <div className="mt-4 p-3 bg-white rounded-lg border border-vintage-green/20">
                                <p className="text-sm text-charcoal">
                                    <strong>Emergency?</strong> For urgent issues like lost cards or suspicious activity, call our 24/7 hotline immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                        <a href="#" className="p-3 bg-parchment rounded-lg hover:bg-warm-cream transition-colors flex items-center justify-between">
                            <span className="text-charcoal font-semibold">Security Center</span>
                            <ChevronDown className="w-5 h-5 text-charcoal-light rotate-[-90deg]" />
                        </a>
                        <a href="#" className="p-3 bg-parchment rounded-lg hover:bg-warm-cream transition-colors flex items-center justify-between">
                            <span className="text-charcoal font-semibold">Fee Schedule</span>
                            <ChevronDown className="w-5 h-5 text-charcoal-light rotate-[-90deg]" />
                        </a>
                        <a href="#" className="p-3 bg-parchment rounded-lg hover:bg-warm-cream transition-colors flex items-center justify-between">
                            <span className="text-charcoal font-semibold">Terms & Conditions</span>
                            <ChevronDown className="w-5 h-5 text-charcoal-light rotate-[-90deg]" />
                        </a>
                        <a href="#" className="p-3 bg-parchment rounded-lg hover:bg-warm-cream transition-colors flex items-center justify-between">
                            <span className="text-charcoal font-semibold">Privacy Policy</span>
                            <ChevronDown className="w-5 h-5 text-charcoal-light rotate-[-90deg]" />
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
