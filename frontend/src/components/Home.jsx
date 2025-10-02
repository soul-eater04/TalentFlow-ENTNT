import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, ClipboardList } from "lucide-react";

const features = [
  {
    title: "Jobs Management",
    description: "Create, edit, reorder, and archive jobs with ease.",
    icon: <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  },
  {
    title: "Candidates",
    description:
      "Track candidates across stages with Kanban boards and detailed profiles.",
    icon: <Users className="h-6 w-6 text-green-600 dark:text-green-400" />,
  },
  {
    title: "Assessments",
    description:
      "Build assessments and let candidates complete them in real time.",
    icon: (
      <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-400" />
    ),
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <header className="max-w-5xl mx-auto text-center py-20 px-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Welcome to <span className="text-blue-600 dark:text-blue-400">TalentFlow</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          A lightweight hiring platform for managing jobs, candidates, and assessments —
          all in one place.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/jobs"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/candidates"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 
            text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            View Candidates
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Built for the recruitment process of ENTNT with ❤️
        </p>
      </footer>
    </div>
  );
};

export default Home;
