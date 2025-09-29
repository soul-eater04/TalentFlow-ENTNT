import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "./ui/button";
import { CreateJobModal } from "./CreateJobModal";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ApplyJobModal } from "./ApplyJobModal";
import { Search, MapPin, Users, Calendar, GripVertical, Briefcase } from "lucide-react";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sort, setSort] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [applyJobId, setApplyJobId] = useState(null);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Jobs Board</h1>
                <p className="text-gray-500 mt-1">Discover and manage job opportunities</p>
              </div>
            </div>
            <CreateJobModal fetchJobs={fetchJobs} />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search job titles..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
            >
              <option value="">All statuses</option>
              <option value="active">Active Jobs</option>
              <option value="archived">Archived Jobs</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="title:asc">Title A-Z</option>
              <option value="title:desc">Title Z-A</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading jobs...</span>
            </div>
          </div>
        ) : jobs?.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or create a new job posting.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="jobs">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="divide-y divide-gray-100"
                  >
                    {jobs?.map((job, index) => (
                      <Draggable
                        key={job.id}
                        draggableId={String(job.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-6 transition-all duration-200 hover:bg-gray-50 ${
                              snapshot.isDragging ? 'bg-blue-50 shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="mt-1 p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4 text-gray-400" />
                              </div>

                              {/* Job Content */}
                              <div className="flex-1 min-w-0">
                                {/* Job Header */}
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                                  <div className="flex-1">
                                    <Link
                                      to={`/jobs/${job.slug}`}
                                      className="group block"
                                    >
                                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                                        {job.title}
                                      </h3>
                                    </Link>
                                    <p className="text-gray-600 leading-relaxed line-clamp-2">
                                      {job.description}
                                    </p>
                                  </div>

                                  {/* Status Badge */}
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        job.status === "active"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      <div
                                        className={`w-2 h-2 rounded-full mr-2 ${
                                          job.status === "active" ? "bg-green-500" : "bg-gray-400"
                                        }`}
                                      ></div>
                                      {job.status === "active" ? "Active" : "Archived"}
                                    </span>
                                  </div>
                                </div>

                                {/* Job Meta Information */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>By {job.postedBy}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>{job.location}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>{job.vacancies} positions</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>{new Date(job.postingDate).toLocaleDateString()}</span>
                                  </div>
                                </div>

                                {/* Tags */}
                                {job.tags?.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {job.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <Button
                                    onClick={() => setApplyJobId(job.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                  >
                                    Apply Now
                                  </Button>
                                  <Link to={`/kanban/${job.id}`}>
                                    <Button
                                      variant="outline"
                                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 w-full sm:w-auto"
                                    >
                                      View Progress Board
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page <span className="font-semibold text-gray-900">{page}</span> of{" "}
                  <span className="font-semibold text-gray-900">{totalPages}</span>
                </span>
              </div>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Apply Job Modal */}
        <ApplyJobModal
          jobId={applyJobId}
          open={!!applyJobId}
          onClose={() => setApplyJobId(null)}
        />
      </div>
    </div>
  );
};

export default Jobs;