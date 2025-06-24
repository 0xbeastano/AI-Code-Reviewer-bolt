import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, CheckCircle, ArrowRight } from 'lucide-react';
import CountUp from 'react-countup';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
  metrics?: {
    label: string;
    value: string;
  }[];
}

interface Metric {
  value: number;
  label: string;
  suffix: string;
}

const SocialProof: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const testimonials: Testimonial[] = [
    {
      id: 1,
      quote: "CodeAI has transformed our development process. We've reduced security vulnerabilities by 87% and accelerated our release cycle by 3x.",
      author: "Sarah Chen",
      role: "CTO",
      company: "FinTech Solutions",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      metrics: [
        { label: "Security Vulnerabilities", value: "-87%" },
        { label: "Release Cycle", value: "3x faster" }
      ]
    },
    {
      id: 2,
      quote: "The ROI is incredible. We've saved over 2,000 engineering hours per month while improving our code quality metrics across all teams.",
      author: "Michael Rodriguez",
      role: "VP of Engineering",
      company: "TechCorp Inc.",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      metrics: [
        { label: "Engineering Hours Saved", value: "2,000+/month" },
        { label: "Code Quality", value: "+42%" }
      ]
    },
    {
      id: 3,
      quote: "Implementing CodeAI was the best decision we made last year. Our developers love the instant feedback, and our security team can finally sleep at night.",
      author: "Jennifer Park",
      role: "Director of Security",
      company: "HealthTech Systems",
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      metrics: [
        { label: "Security Incidents", value: "-92%" },
        { label: "Developer Satisfaction", value: "+78%" }
      ]
    }
  ];

  const metrics: Metric[] = [
    { value: 5000, label: "Enterprise Teams", suffix: "+" },
    { value: 10, label: "Million Code Reviews", suffix: "M+" },
    { value: 87, label: "Fewer Security Vulnerabilities", suffix: "%" },
    { value: 42, label: "Faster Development Cycles", suffix: "%" }
  ];

  const complianceBadges = [
    "SOC 2 Type II", "GDPR Compliant", "HIPAA Ready", "ISO 27001"
  ];

  const clientLogos = [
    "Microsoft", "Amazon", "IBM", "Shopify", "Airbnb", "Netflix"
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="testimonials" className="py-20 relative">
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Enterprise Teams</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join thousands of companies using CodeAI to ship better code faster
            </p>
          </motion.div>
        </div>

        {/* Metrics Counter */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-dark-800 rounded-xl p-6 border border-dark-600 text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">
                {inView ? (
                  <CountUp
                    end={metric.value}
                    duration={2.5}
                    suffix={metric.suffix}
                    useEasing={true}
                  />
                ) : (
                  <span>0{metric.suffix}</span>
                )}
              </div>
              <div className="text-sm text-gray-400">{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={item}
              className="bg-dark-800 rounded-xl p-6 border border-dark-600 hover:border-primary-700 transition-all duration-300"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.1)" }}
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              
              <blockquote className="text-gray-300 mb-6">"{testimonial.quote}"</blockquote>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
              
              {testimonial.metrics && (
                <div className="mt-6 pt-6 border-t border-dark-600 grid grid-cols-2 gap-4">
                  {testimonial.metrics.map((metric, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl font-bold text-primary-400">{metric.value}</div>
                      <div className="text-xs text-gray-400">{metric.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Client Logos */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-center text-sm text-gray-400 mb-8">Trusted by engineering teams at</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-70">
            {clientLogos.map((company) => (
              <div key={company} className="text-gray-400 font-semibold text-xl">
                {company}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Compliance Badges */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-sm text-gray-400 mb-6">Enterprise-ready security and compliance</p>
          <div className="flex flex-wrap justify-center gap-4">
            {complianceBadges.map((badge) => (
              <div 
                key={badge}
                className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm flex items-center"
              >
                <CheckCircle className="w-4 h-4 text-primary-400 mr-2" />
                {badge}
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <a 
              href="/security" 
              className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors"
            >
              Learn more about our security practices
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;