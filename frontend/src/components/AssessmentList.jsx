import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AssessmentList = () => {
  const { jobId } = useParams();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await fetch(`/api/assessments/${jobId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch assessments");
        }
        const data = await res.json();
        setAssessments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [jobId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading assessments...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 dark:text-red-400">
        <p>Error: {error}</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Available Assessments
      </h2>

      {assessments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">
            No assessments available for this job.
          </p>
          <Link
            to="/jobs"
            className="mt-4 inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Jobs
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((assessment) => (
            <Link
              to={`/take-assessment/${assessment.id}/${jobId}`}
              key={assessment.id}
            >
              <li className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {assessment.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Click to start this assessment
                </p>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssessmentList;
