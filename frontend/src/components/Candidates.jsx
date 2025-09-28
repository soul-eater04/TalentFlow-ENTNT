import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { List } from "react-virtualized";
import { Link } from "react-router-dom";

const ROW_HEIGHT = 60;
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
    console.log("useEffect triggered. Stage:", stage, "Page:", page);
    const fetchCandidates = async () => {
      if (isFetching.current) {
        console.log("Fetch already in progress, returning.");
        return;
      }
      isFetching.current = true;
      setLoading(true);

      try {
        console.log("Fetching data from API...");
        // NOTE: Replace with actual axios call if running in a real environment
        const res = await axios.get("/api/candidates", {
          params: { stage, page },
        });

        const { paginated: data, totalPages: newTotalPages } = res.data;
        setTotalPages(newTotalPages);
        console.log("API response data length:", data.length, "Total Pages:", newTotalPages);

        if (page === 1) {
          setCandidates(data);
        } else {
          setCandidates((prev) => [...prev, ...data]);
        }

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
    console.log("Filtering candidates. Search term:", search);
    if (!candidates || !Array.isArray(candidates)) {
        return [];
    }
    if (!search) return candidates;
    const lower = search.toLowerCase();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower)
    );
  }, [candidates, search]);

  const rowRenderer = ({ index, key, style }) => {
    // --- FIX: Exclude style.width from the isNaN check ---
    // The width property is intentionally '100%' (string) in react-virtualized.
    if (style && (isNaN(style.height) || isNaN(style.top))) {
      console.error("Invalid NUMERIC style property (NaN) detected:", style);
      return null;
    }
    
    const candidate = filteredCandidates[index];
    if (!candidate) {
      console.log("No candidate found at index:", index);
      return null;
    }

    return (
      <div
        key={key}
        style={style}
        className="flex items-center justify-between border-b px-4"
      >
        <div>
          <Link to={`/candidates/${candidate.id}`} className="hover:underline">
            <div className="font-medium">{candidate.name}</div>
          </Link>
          <div className="text-sm text-gray-500">{candidate.email}</div>
        </div>
        <div className="text-sm">{candidate.stage}</div>
      </div>
    );
  };

  const rowCount = filteredCandidates ? filteredCandidates.length : 0;

  console.log("Rendering List with props:", {
    width: LIST_WIDTH,
    height: LIST_HEIGHT,
    rowCount: rowCount,
    rowHeight: ROW_HEIGHT,
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Candidates</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <select
          value={stage}
          onChange={(e) => {
            setStage(e.target.value);
            setPage(1);
            setCandidates([]); // Clear candidates to trigger re-fetch
          }}
          className="border p-2 rounded"
        >
          <option value="">All stages</option>
          <option value="applied">Applied</option>
          <option value="screening">Screening</option>
          <option value="technical">Technical Interview</option>
          <option value="offer">Offer</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      {rowCount > 0 || loading ? (
        <div style={{ height: LIST_HEIGHT, width: "100%" }}>
          <List
            width={LIST_WIDTH}
            height={LIST_HEIGHT}
            rowCount={rowCount}
            rowHeight={ROW_HEIGHT}
            rowRenderer={rowRenderer}
            onRowsRendered={({ stopIndex }) => {
              if (
                hasMore && 
                !loading && 
                stopIndex >= filteredCandidates.length - 5
              ) {
                setPage((p) => p + 1);
              }
            }}
          />
        </div>
      ) : (
          <div className="text-center py-4 text-gray-500">
              No candidates found.
          </div>
      )}

      {loading && (
        <div className="text-center py-4 text-gray-500">Loading more...</div>
      )}
    </div>
  );
};

export default Candidates;
