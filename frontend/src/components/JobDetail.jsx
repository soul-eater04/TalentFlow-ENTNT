import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const JobDetail = () => {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await axios.get(`/api/jobs/${slug}`);
        setJob(data);
      } catch (err) {
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slug]);

  if (loading) {
    return <p className="text-center py-6 text-gray-700 dark:text-gray-300">Loading job details...</p>;
  }

  if (!job) {
    return <p className="text-center py-6 text-red-500 dark:text-red-400">Job not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 shadow rounded-lg space-y-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b pb-4 border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {job.title}
        </h1>
        <span
          className={`inline-block mt-2 px-3 py-1 rounded text-sm font-medium ${
            job.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {job.status}
        </span>
      </header>

      {/* Description */}
      {job.description && (
        <section>
          <h2 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Description</h2>
          <p className="text-gray-700 dark:text-gray-300">{job.description}</p>
        </section>
      )}

      {/* Job Info */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {job.postedBy && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Posted By</h3>
            <p className="text-gray-800 dark:text-gray-200">{job.postedBy}</p>
          </div>
        )}
        {job.location && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
            <p className="text-gray-800 dark:text-gray-200">{job.location}</p>
          </div>
        )}
        {job.vacancies !== undefined && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vacancies</h3>
            <p className="text-gray-800 dark:text-gray-200">{job.vacancies}</p>
          </div>
        )}
        {job.postingDate && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Posted On</h3>
            <p className="text-gray-800 dark:text-gray-200">
              {new Date(job.postingDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </section>

      {/* Tags */}
      {job.tags?.length > 0 && (
        <section>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default JobDetail;
