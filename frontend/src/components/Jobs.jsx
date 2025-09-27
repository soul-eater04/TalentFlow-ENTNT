import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "./ui/button";
import { CreateJobModal } from "./CreateJobModal";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sort, setSort] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/jobs", {
        params: { search, status, page, pageSize, sort },
      });
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

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(jobs);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // optimistic update
    setJobs(reordered);

    try {
      await axios.patch(`/api/jobs/${moved.id}/reorder`, {
        fromOrder: result.source.index,
        toOrder: result.destination.index,
      });
    } catch (err) {
      console.error("Reorder failed, rolling back", err);
      // rollback
      setJobs(jobs);
    }
  };

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
          <option value="active">Active</option>
          <option value="archived">Archived</option>
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

      {/* Jobs List with Drag & Drop */}
      {loading ? (
        <p className="text-center py-6">Loading...</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="jobs">
            {(provided) => (
              <ul
                className="border rounded divide-y"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {jobs?.map((job, index) => (
                  <Draggable
                    key={job.id}
                    draggableId={String(job.id)}
                    index={index}
                  >
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-4 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <Link
                              to={`/jobs/${job.slug}`}
                              className="hover:underline hover:text-blue-600"
                            >
                              <h3 className="text-lg font-semibold">
                                {job.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-500">
                              {job.description}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              job.status === "active"
                                ? "bg-green-100 text-green-800"
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
                            Posted on:{" "}
                            {new Date(job.postingDate).toLocaleDateString()}
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
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
