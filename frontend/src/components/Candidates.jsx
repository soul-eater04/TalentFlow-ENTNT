import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { List } from "react-virtualized";
import { Link } from "react-router-dom";
import { Search, Filter, Users, Mail, ChevronRight, Loader2 } from "lucide-react";

const ROW_HEIGHT = 80;
const PAGE_SIZE = 50;
const LIST_WIDTH = 1500;
const LIST_HEIGHT = 600;

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [stage, setStage] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const isFetching = useRef(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);
      try {
        const res = await axios.get("/api/candidates", {
          params: { stage, page },
        });
        const { paginated: data, totalPages: newTotalPages } = res.data;
        setTotalPages(newTotalPages);
        if (page === 1) setCandidates(data);
        else setCandidates((prev) => [...prev, ...data]);
        setHasMore(page < newTotalPages);
      } catch (err) {
        console.error("Failed to fetch candidates", err);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };
    fetchCandidates();
  }, [stage, page]);

  const filteredCandidates = useMemo(() => {
    if (!candidates || !Array.isArray(candidates)) return [];
    if (!search) return candidates;
    const lower = search.toLowerCase();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower)
    );
  }, [candidates, search]);

  const getStageColor = (stage) => {
    const colors = {
      applied: "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-400",
      screening: "bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-400",
      technical: "bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-400",
      offer: "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-400",
      hired: "bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400",
      rejected: "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-400",
    };
    return colors[stage] || "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
  };

  const rowRenderer = ({ index, key, style }) => {
    if (style && (isNaN(style.height) || isNaN(style.top))) return null;
    const candidate = filteredCandidates[index];
    if (!candidate) return null;

    return (
      <Link
        to={`/candidates/${candidate.id}`}
        key={key}
        style={style}
        className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group cursor-pointer rounded-lg mb-2"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md group-hover:scale-110 transition-transform duration-200">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {candidate.name}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{candidate.email}</span>
              </div>
            <div className={`mt-1 text-sm font-medium ${getStageColor(candidate.stage)} inline-block px-2 py-0.5 rounded`}>
              Stage: {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
            </div>
          </div>
        </div>

        {/* Stage Badge */}
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}>
            {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-200" />
        </div>
      </Link>
    );
  };

  const rowCount = filteredCandidates ? filteredCandidates.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Candidates</h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Manage and track all your candidates in one place
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{rowCount}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Candidates</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Stage Filter */}
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <select
                value={stage}
                onChange={(e) => {
                  setStage(e.target.value);
                  setPage(1);
                  setCandidates([]);
                }}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer"
              >
                <option value="">All Stages</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="technical">Technical Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {rowCount > 0 || loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div style={{ height: LIST_HEIGHT, width: "100%" }}>
              <List
                width={LIST_WIDTH}
                height={LIST_HEIGHT}
                rowCount={rowCount}
                rowHeight={ROW_HEIGHT}
                rowRenderer={rowRenderer}
                onRowsRendered={({ stopIndex }) => {
                  if (hasMore && !loading && stopIndex >= filteredCandidates.length - 5) {
                    setPage((p) => p + 1);
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No candidates found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {search || stage ? "Try adjusting your filters" : "Get started by adding your first candidate"}
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading more candidates...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;
