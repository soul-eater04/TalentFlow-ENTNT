import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Mail,
  Phone,
  MapPin,
  Loader,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { MentionInput } from "mentis";
import "mentis/dist/index.css";

const getStageColor = (stage) => {
  switch (stage) {
    case "applied":
      return "bg-blue-500 dark:bg-blue-700";
    case "screening":
      return "bg-yellow-500 dark:bg-yellow-600";
    case "technical":
      return "bg-purple-500 dark:bg-purple-700";
    case "offer":
      return "bg-green-500 dark:bg-green-700";
    case "hired":
      return "bg-green-700 dark:bg-green-800";
    case "rejected":
      return "bg-red-500 dark:bg-red-600";
    default:
      return "bg-gray-500 dark:bg-gray-600";
  }
};

const getStageIcon = (stage) => {
  switch (stage) {
    case "hired":
    case "offer":
      return <CheckCircle className="w-4 h-4 text-white" />;
    case "rejected":
      return <XCircle className="w-4 h-4 text-white" />;
    case "applied":
      return <Mail className="w-4 h-4 text-white" />;
    case "screening":
      return <Phone className="w-4 h-4 text-white" />;
    case "technical":
      return <TrendingUp className="w-4 h-4 text-white" />;
    default:
      return <Clock className="w-4 h-4 text-white" />;
  }
};

const CandidateDetail = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  const [note, setNote] = useState("");
  const [loadingNote, setLoadingNote] = useState(false);

  const fetchCandidate = async () => {
    try {
      const res = await axios.get(`/api/candidates/${id}/timeline`);
      setCandidate(res.data);
    } catch (error) {
      console.error("Failed to fetch candidate details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setLoadingNote(true);
    try {
      await axios.put(`/api/candidates/${id}`, { note });
      toast.success("Note saved successfully!");
      setNote("");
      fetchCandidate();
    } catch (err) {
      console.error("Failed to save note:", err);
      toast.error("Failed to save note. Try again.");
    } finally {
      setLoadingNote(false);
    }
  };

  useEffect(() => {
    if (id) fetchCandidate();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 dark:text-gray-400">
        <Loader className="animate-spin text-indigo-500 mr-2" />
        <span>Loading candidate details...</span>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 dark:text-red-400">
        <span>Candidate not found</span>
      </div>
    );
  }

  const reversedTimeline = [...candidate.timeline].reverse();

  return (
    <div className="flex flex-col gap-8 p-6 max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Candidate Header */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">{candidate.name}</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span>{candidate.email}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{candidate.location}</span>
              </div>
            </div>
            <Badge
              className={`text-base px-3 py-1 ${getStageColor(candidate.stage)} text-white`}
            >
              {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 relative pl-12">
            {reversedTimeline.map((entry, idx) => (
              <div key={idx} className="flex items-start relative">
                <div
                  className={`absolute -left-10 flex items-center justify-center w-8 h-8 rounded-full shadow-md z-10 ${getStageColor(
                    entry.stage
                  )}`}
                >
                  {getStageIcon(entry.stage)}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {entry.stage.charAt(0).toUpperCase() + entry.stage.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(entry.stageUpdatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {candidate.notes && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Notes about the candidate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {candidate.notes.map((note, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 py-2">
                  <p className="text-sm text-gray-900 dark:text-gray-100">{index + 1}. {note.text}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(note.date).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Write a Note</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Add an internal note about this candidate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddNote} className="space-y-4">
            <MentionInput
              keepTriggerOnSelect={true}
              dataValue={note}
              onChange={(mentionData) => setNote(mentionData.dataValue)}
              options={[
                { label: "Alice", value: "Alice" },
                { label: "Bob", value: "Bob" },
                { label: "Charlie", value: "Charlie" },
              ]}
              className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-2 w-full"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loadingNote}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loadingNote ? "Saving..." : "Save Note"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateDetail;
