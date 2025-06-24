import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Clock, Bug, Users, DollarSign, CheckCircle, Zap, Brain, Shield, Code2 } from 'lucide-react';

interface ProblemSolution {
  id: number;
  problem: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
  solution: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
  metrics: {
    label: string;
    value: string;
  }[];
}

const ProblemSolutionMatrix: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const problemSolutions: ProblemSolution[] = [
    {
      id: 1,
      problem: {
        icon: <Clock className="w-6 h-6 text-red-400" />,
        title: "Manual Code Reviews Are Too Slow",
        description: "Engineering teams spend 20+ hours per week on manual code reviews, creating bottlenecks and delaying releases."
      },
      solution: {
        icon: <Zap className="w-6 h-6 text-primary-400" />,
        title: "AI-Powered Automated Reviews",
        description: "Our AI analyzes code in seconds, providing instant feedback and allowing developers to focus on complex problems."
      },
      metrics: [
        { label: "Time Saved", value: "85%" },
        { label: "Release Velocity", value: "+63%" },
        { label: "Developer Productivity", value: "+42%" }
      ]
    },
    {
      id: 2,
      problem: {
        icon: <Bug className="w-6 h-6 text-red-400" />,
        title: "Security Vulnerabilities Reach Production",
        description: "Critical security issues are missed during manual reviews, leading to costly breaches and emergency fixes."
      },
      solution: {
        icon: <Shield className="w-6 h-6 text-primary-400" />,
        title: "Proactive Security Scanning",
        description: "Our AI detects OWASP Top 10 vulnerabilities, insecure dependencies, and custom security rules before deployment."
      },
      metrics: [
        { label: "Vulnerabilities Detected", value: "+94%" },
        { label: "False Positives", value: "-78%" },
        { label: "Security Incidents", value: "-82%" }
      ]
    },
    {
      id: 3,
      problem: {
        icon: <Users className="w-6 h-6 text-red-400" />,
        title: "Inconsistent Code Quality Standards",
        description: "Teams struggle to maintain consistent code quality across different developers, projects, and deadlines."
      },
      solution: {
        icon: <Code2 className="w-6 h-6 text-primary-400" />,
        title: "Automated Quality Enforcement",
        description: "Our AI enforces consistent standards across your entire codebase, automatically suggesting improvements."
      },
      metrics: [
        { label: "Code Quality Score", value: "+47%" },
        { label: "Technical Debt", value: "-35%" },
        { label: "Onboarding Time", value: "-40%" }
      ]
    },
    {
      id: 4,
      problem: {
        icon: <DollarSign className="w-6 h-6 text-red-400" />,
        title: "High Cost of Performance Issues",
        description: "Performance bottlenecks discovered late in development lead to expensive refactoring and infrastructure costs."
      },
      solution: {
        icon: <Brain className="w-6 h-6 text-primary-400" />,
        title: "Intelligent Performance Optimization",
        description: "Our AI identifies and fixes performance issues early, optimizing code for speed and resource efficiency."
      },
      metrics: [
        { label: "Performance Gain", value: "+58%" },
        { label: "Infrastructure Costs", value: "-32%" },
        { label: "User Experience", value: "+45%" }
      ]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-20 bg-dark-800 relative">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6" ref={ref}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform Your Development Process</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See how our AI-powered code review platform solves critical challenges facing enterprise development teams
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="space-y-16"
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {problemSolutions.map((item, index) => (
            <motion.div 
              key={item.id}
              variants={item}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Problem Card */}
              <div className="bg-dark-700 rounded-xl p-6 border border-dark-600 h-full">
                <div className="flex items-start">
                  <div className="p-3 bg-red-900/30 rounded-lg mr-4">
                    {item.problem.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">{item.problem.title}</h3>
                    <p className="text-gray-400">{item.problem.description}</p>
                  </div>
                </div>
              </div>

              {/* Solution Card */}
              <div className="bg-gradient-card rounded-xl p-6 border border-primary-700/30 h-full">
                <div className="flex items-start">
                  <div className="p-3 bg-primary-900/50 rounded-lg mr-4">
                    {item.solution.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">{item.solution.title}</h3>
                    <p className="text-gray-300">{item.solution.description}</p>
                    
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      {item.metrics.map((metric, i) => (
                        <div key={i} className="text-center">
                          <div className="text-xl font-bold text-primary-400">{metric.value}</div>
                          <div className="text-xs text-gray-400">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="inline-flex items-center px-6 py-3 bg-dark-700 border border-primary-700 rounded-lg">
            <CheckCircle className="w-5 h-5 text-primary-400 mr-2" />
            <span className="text-gray-300">Average ROI: <span className="font-bold text-white">327%</span> within 6 months</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSolutionMatrix;