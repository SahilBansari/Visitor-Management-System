import React from 'react';
import type { Language } from '../../../App';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Card,
  CardHeader,
  Text,
  Link,
  Divider,
} from '@fluentui/react-components';

interface HelpContentProps {
  lang: Language;
}

const content = {
  en: {
    title: 'Help & Support',
    subtitle: 'Guides, FAQs, and support contacts for the VMS portal.',
    sections: {
      faq: 'Frequently Asked Questions',
      contact: 'Contact Support',
      docs: 'Documentation'
    },
    faqs: [
      { q: 'How do I approve a visitor?', a: 'Go to the "Visitors" tab, find the request under "Pending", and click "Approve".' },
      { q: 'How do I change my password?', a: 'Go to Settings > Security > Change Password.' },
      { q: 'What happens during a lockdown?', a: 'All turnstiles are locked, and alerts are sent to security staff. Only Admins can lift a lockdown.' },
      { q: 'Can I add a new officer?', a: 'Yes, go to the "Officers" directory and click "Add Officer".' },
    ],
    contact: {
      tech: 'Technical Support',
      security: 'Security Control Room',
      email: 'Email Us',
      call: 'Call Now'
    },
    docs: {
      manual: 'User Manual (PDF)',
      policy: 'Security Policy',
      video: 'Video Tutorials'
    }
  },
  hi: {
    title: 'सहायता और समर्थन',
    subtitle: 'VMS पोर्टल के लिए गाइड, अक्सर पूछे जाने वाले प्रश्न और सहायता संपर्क।',
    sections: {
      faq: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)',
      contact: 'सपोर्ट से संपर्क करें',
      docs: 'दस्तावेज़ीकरण'
    },
    faqs: [
      { q: 'मैं आगंतुक को कैसे स्वीकृत करूं?', a: '"Visitors" टैब पर जाएं, "Pending" के तहत अनुरोध ढूंढें, और "Approve" पर क्लिक करें।' },
      { q: 'मैं अपना पासवर्ड कैसे बदलूं?', a: 'Settings > Security > Change Password पर जाएं।' },
      { q: 'लॉकडाउन के दौरान क्या होता है?', a: 'सभी टर्नस्टाइल लॉक हो जाते हैं, और सुरक्षा कर्मचारियों को अलर्ट भेजे जाते हैं। केवल एडमिन ही लॉकडाउन हटा सकते हैं।' },
      { q: 'क्या मैं एक नया अधिकारी जोड़ सकता हूँ?', a: 'हां, "Officers" निर्देशिका पर जाएं और "Add Officer" पर क्लिक करें।' },
    ],
    contact: {
      tech: 'तकनीकी सहायता',
      security: 'सुरक्षा नियंत्रण कक्ष',
      email: 'हमें ईमेल करें',
      call: 'अभी कॉल करें'
    },
    docs: {
      manual: 'उपयोगकर्ता नियमावली (PDF)',
      policy: 'सुरक्षा नीति',
      video: 'वीडियो ट्यूटोरियल'
    }
  },
  mr: {
    title: 'मदत आणि समर्थन',
    subtitle: 'VMS पोर्टलसाठी मार्गदर्शक, वारंवार विचारले जाणारे प्रश्न आणि समर्थन संपर्क.',
    sections: {
      faq: 'वारंवार विचारले जाणारे प्रश्न (FAQ)',
      contact: 'सपोर्टशी संपर्क साधा',
      docs: 'दस्तऐवजीकरण'
    },
    faqs: [
      { q: 'मी अभ्यागताला मंजूरी कशी देऊ?', a: '"Visitors" टॅबवर जा, "Pending" अंतर्गत विनंती शोधा आणि "Approve" क्लिक करा.' },
      { q: 'मी माझा पासवर्ड कसा बदलू?', a: 'Settings > Security > Change Password वर जा.' },
      { q: 'लॉकडाऊन दरम्यान काय होते?', a: 'सर्व टर्नस्टाइल लॉक केले जातात आणि सुरक्षा कर्मचाऱ्यांना अलर्ट पाठवले जातात. फक्त अ‍ॅडमिन लॉकडाऊन उठवू शकतात.' },
      { q: 'मी नवीन अधिकारी जोडू शकतो का?', a: 'होय, "Officers" डिरेक्टरीवर जा आणि "Add Officer" क्लिक करा.' },
    ],
    contact: {
      tech: 'तांत्रिक सहाय्य',
      security: 'सुरक्षा नियंत्रण कक्ष',
      email: 'आम्हाला ईमेल करा',
      call: 'आता कॉल करा'
    },
    docs: {
      manual: 'वापरकर्ता मॅन्युअल (PDF)',
      policy: 'सुरक्षा धोरण',
      video: 'व्हिडिओ ट्यूटोरियल्स'
    }
  }
};

const HelpContent: React.FC<HelpContentProps> = ({ lang }) => {
  const t = content[lang];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-100">{t.title}</h1>
        <p className="text-neutral-500 mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main FAQ Section */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <CardHeader header={<h3 className="text-lg font-bold">{t.sections.faq}</h3>} />
            <Accordion collapsible>
              {t.faqs.map((faq, index) => (
                <AccordionItem value={index} key={index}>
                  <AccordionHeader size="large">{faq.q}</AccordionHeader>
                  <AccordionPanel className="text-neutral-600 dark:text-neutral-300 pb-4">
                    {faq.a}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <CardHeader header={<h3 className="text-lg font-bold">{t.sections.docs}</h3>} />
            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                    <Text>{t.docs.manual}</Text>
                </div>
                <Divider />
                <div className="flex items-center gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-blue-500">policy</span>
                    <Text>{t.docs.policy}</Text>
                </div>
                <Divider />
                <div className="flex items-center gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-red-600">play_circle</span>
                    <Text>{t.docs.video}</Text>
                </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Contacts */}
        <div className="space-y-6">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <CardHeader header={<h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">{t.contact.tech}</h3>} />
            <div className="p-4 pt-0 flex flex-col gap-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    For system errors, login issues, or bug reports.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="material-symbols-outlined">call</span> +91 20 2550 1234
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="material-symbols-outlined">mail</span> support@nic.in
                </div>
                <Button appearance="primary">{t.contact.email}</Button>
            </div>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
            <CardHeader header={<h3 className="text-lg font-bold text-red-800 dark:text-red-200">{t.contact.security}</h3>} />
             <div className="p-4 pt-0 flex flex-col gap-4">
                <p className="text-sm text-red-700 dark:text-red-300">
                    For physical security breaches or emergency lockdown.
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-red-600">
                    <span className="material-symbols-outlined">emergency</span> 100 / 112
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="material-symbols-outlined">call</span> +91 20 2550 9999
                </div>
                <Button appearance="primary" style={{ backgroundColor: '#B00020', color: 'white' }}>{t.contact.call}</Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default HelpContent;