import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const AssessmentList = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
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

  if (loading) return <p>Loading assessments...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Available Assessments</h2>
      {assessments.length === 0 ? (
        <p>No assessments available for this job.</p>
      ) : (
        <ul className="space-y-2">
          {assessments.map((assessment) => (
            <Link to={`/take-assessment/${assessment.id}/${jobId}`} key={assessment.id}>
              <li
                className="cursor-pointer p-3 rounded-lg shadow-md hover:bg-gray-100 transition"
              >
              {assessment.name}
            </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssessmentList;
