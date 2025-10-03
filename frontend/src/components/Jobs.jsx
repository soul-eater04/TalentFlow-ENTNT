import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "./ui/button";
import { CreateJobModal } from "./CreateJobModal";
import { EditJobModal } from "./EditJobModal";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ApplyJobModal } from "./ApplyJobModal";
import { Search, MapPin, Users, Calendar, GripVertical, Briefcase, Edit } from "lucide-react";
import { toast } from "sonner";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [applyJobId, setApplyJobId] = useState(null);
  const [editJob, setEditJob] = useState(null);

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

    setJobs(reordered); // optimistic update

    try {
      await axios.patch(`/api/jobs/${moved.id}/reorder`, {
        fromOrder: result.source.index,
        toOrder: result.destination.index,
      });
      toast.success("Job order updated");
    } catch (err) {
      console.error("Reorder failed", err);
      setJobs(jobs); // rollback
      toast.error("Failed to reorder jobs");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Jobs Board</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Discover and manage job opportunities
                </p>
              </div>
            </div>
            <CreateJobModal fetchJobs={fetchJobs} />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Filter & Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search job titles..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 
              focus:border-transparent transition-all duration-200 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">All statuses</option>
              <option value="active">Active Jobs</option>
              <option value="archived">Archived Jobs</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 
              focus:border-transparent transition-all duration-200 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading jobs...</span>
            </div>
          </div>
        ) : jobs?.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No jobs found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria or create a new job posting.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="jobs">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="divide-y divide-gray-100 dark:divide-gray-700"
                  >
                    {jobs?.map((job, index) => (
                      <Draggable key={job.id} draggableId={String(job.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-6 transition-all duration-200 ${
                              snapshot.isDragging
                                ? "bg-blue-50 dark:bg-blue-900 shadow-lg"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="mt-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                              </div>

                              {/* Job Content */}
                              <div className="flex-1 min-w-0">
                                {/* Job Header */}
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                                  <div className="flex-1">
                                    <Link to={`/jobs/${job.slug}`} className="group block">
                                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mb-2">
                                        {job.title}
                                      </h3>
                                    </Link>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                                      {job.description}
                                    </p>
                                  </div>

                                  {/* Status Toggle & Edit Button */}
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => setEditJob(job)}
                                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                      title="Edit job"
                                    >
                                      <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        const newStatus = job.status === "active" ? "archived" : "active";
                                        const prevJobs = [...jobs]; // keep backup in case API fails

                                        // optimistic update
                                        setJobs((current) =>
                                          current.map((j) =>
                                            j.id === job.id ? { ...j, status: newStatus } : j
                                          )
                                        );

                                        try {
                                          await axios.patch(`/api/jobs/${job.id}`, { status: newStatus });
                                          toast.success(`Job marked as ${newStatus}`);
                                        } catch (err) {
                                          console.error("Failed to update job status:", err);
                                          setJobs(prevJobs); // rollback
                                          toast.error("Failed to update job status. Please retry.");
                                        }
                                      }}
                                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 ${
                                        job.status === "active"
                                          ? "bg-green-500"
                                          : "bg-gray-400 dark:bg-gray-600"
                                      }`}
                                    >
                                      <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow transition-transform duration-200 ${
                                          job.status === "active" ? "translate-x-6" : "translate-x-1"
                                        }`}
                                      />
                                    </button>
                                    <span
                                      className={`text-sm font-medium ${
                                        job.status === "active"
                                          ? "text-green-600 dark:text-green-300"
                                          : "text-gray-600 dark:text-gray-400"
                                      }`}
                                    >
                                      {job.status === "active" ? "Active" : "Archived"}
                                    </span>
                                  </div>

                                </div>

                                {/* Job Meta Information */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Users className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                                    <span>By {job.postedBy}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                                    <span>{job.location}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Briefcase className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                                    <span>{job.vacancies} positions</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                                    <span>{new Date(job.postingDate).toLocaleDateString()}</span>
                                  </div>
                                </div>

                                {/* Tags */}
                                {job.tags?.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {job.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium 
                                        bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
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
                                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 w-full sm:w-auto"
                                    >
                                      View Progress Board
                                    </Button>
                                  </Link>
                                  <Link to={`/assessment-builder/${job.id}`}>
                                    <Button
                                      variant="outline"
                                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 w-full sm:w-auto"
                                    >
                                      Assessment Builder
                                    </Button>
                                  </Link>
                                  <Link to={`/assessments/${job.id}`}>
                                    <Button
                                      variant="outline"
                                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 w-full sm:w-auto"
                                    >
                                      Take Assessment
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              
              {/* Left controls: Page size + Go to page */}
              <div className="flex items-center gap-4">
                {/* Page Size */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Page size:</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={pageSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      if (newSize > 0) {
                        setPageSize(newSize);
                        setPage(1); // reset to first page when page size changes
                      }
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Go To Page */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Go to page:</label>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={page}
                    onChange={(e) => {
                      let newPage = Number(e.target.value);
                      if (newPage >= 1 && newPage <= totalPages) {
                        setPage(newPage);
                      }
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Right controls: Prev/Next */}
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
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page <span className="font-semibold text-gray-900 dark:text-gray-100">{page}</span> of{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{totalPages}</span>
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
          </div>
        )}


        {/* Apply Job Modal */}
        <ApplyJobModal jobId={applyJobId} open={!!applyJobId} onClose={() => setApplyJobId(null)} />
        
        {/* Edit Job Modal */}
        <EditJobModal 
          job={editJob} 
          open={!!editJob} 
          onClose={() => setEditJob(null)} 
          fetchJobs={fetchJobs} 
        />
      </div>
    </div>
  );
};

export default Jobs;