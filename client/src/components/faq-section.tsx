import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is the minimum amount for SIP?",
    answer: "The minimum SIP amount is ₹500 per month. However, you can invest higher amounts based on your financial goals and capacity."
  },
  {
    question: "Can I stop or modify my SIP?",
    answer: "Yes, you can stop, pause, or modify your SIP amount at any time. SIPs offer complete flexibility without any penalties."
  },
  {
    question: "What returns can I expect from SIP?",
    answer: "SIP returns depend on the mutual fund's performance. Historically, equity mutual funds have generated 10-15% annual returns over long periods."
  },
  {
    question: "Is SIP better than lumpsum investment?",
    answer: "SIP offers benefits like rupee cost averaging and disciplined investing, while lumpsum can be better in rising markets. Both have their advantages based on market conditions and personal preferences."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[hsl(224,71.4%,4.1%)] mb-4" data-testid="text-faq-title">
          Frequently Asked Questions
        </h2>
        <p className="text-[hsl(220,8.9%,46.1%)]">Get answers to common questions about SIP investments</p>
      </div>
      
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <Card key={index} className="calculator-shadow">
            <CardContent className="p-0">
              <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => toggleFAQ(index)}
                data-testid={`button-faq-${index}`}
              >
                <span className="font-medium text-[hsl(224,71.4%,4.1%)]">{faq.question}</span>
                <ChevronDown 
                  className={`text-[hsl(220,8.9%,46.1%)] transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-[hsl(220,8.9%,46.1%)] animate-slide-up" data-testid={`text-faq-answer-${index}`}>
                  {faq.answer}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
