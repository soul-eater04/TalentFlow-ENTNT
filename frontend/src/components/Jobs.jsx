import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { seedJobs } from "../../mirage/db";
import { CreateJobModal } from "./CreateJobModal";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sort, setSort] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Seeding jobs...");
    seedJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/jobs", {
        params: { search, status, page, pageSize, sort },
      });
      console.log("Fetched jobs:", data);
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, status, page, pageSize, sort]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Jobs Board</h2>
        <CreateJobModal fetchJobs={fetchJobs} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search title..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border p-2 rounded flex-1 min-w-[200px]"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="createdAt:desc">Newest</option>
          <option value="createdAt:asc">Oldest</option>
          <option value="title:asc">Title A-Z</option>
          <option value="title:desc">Title Z-A</option>
        </select>
      </div>

      {/* Jobs List */}
      {loading ? (
        <p className="text-center py-6">Loading...</p>
      ) : (
        <ul className="border rounded divide-y divide-gray-200">
          {jobs?.map((job) => (
            <li key={job.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.description}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    job.status === "open"
                      ? "bg-green-100 text-green-800"
                      : job.status === "closed"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4">
                <span>Posted by: {job.postedBy}</span>
                <span>Location: {job.location}</span>
                <span>Vacancies: {job.vacancies}</span>
                <span>
                  Posted on: {new Date(job.postingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Jobs;
