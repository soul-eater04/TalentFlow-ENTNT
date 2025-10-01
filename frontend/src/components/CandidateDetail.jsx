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
      return "bg-blue-500";
    case "screening":
      return "bg-yellow-500";
    case "technical":
      return "bg-purple-500";
    case "offer":
      return "bg-green-500";
    case "hired":
      return "bg-green-700";
    case "rejected":
      return "bg-red-500";
    default:
      return "bg-gray-500";
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

  // inside CandidateDetail component
  const [note, setNote] = useState("");
  const [loadingNote, setLoadingNote] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [noteSuccess, setNoteSuccess] = useState(false);

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
    setNoteError("");
    try {
      await axios.put(`/api/candidates/${id}`, { note });
      console.log("Note saved successfully");
      toast.success("Note saved successfully!");
      console.log("Note saved:", note);
      setNote("");
      fetchCandidate();
    } catch (err) {
      console.error("Failed to save note:", err);
      toast.error("Failed to save note. Try again.");
      setNoteError("Failed to save note. Try again.");
    } finally {
      setLoadingNote(false);
    }
  };


  useEffect(() => {
    if (id) fetchCandidate();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Loader className="animate-spin text-indigo-500" />
          <span>Loading candidate details...</span>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex justify-center items-center min-h-64 text-destructive">
        <span>Candidate not found</span>
      </div>
    );
  }

  // Ensure the timeline is reversed to show the newest stages first (top)
  const reversedTimeline = [...candidate.timeline].reverse();

  return (
    <div className="flex flex-col gap-8 p-6 max-w-3xl mx-auto">
      {/* Candidate Header */}
      <Card>
        <CardHeader>
          <CardTitle>{candidate.name}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span>{candidate.email}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{candidate.location}</span>
              </div>
            </div>
            <Badge
              className={`text-base px-3 py-1 ${getStageColor(
                candidate.stage
              )} text-white`}>
              {candidate.stage.charAt(0).toUpperCase() +
                candidate.stage.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col relative">
            {/* Timeline container with flexbox */}
            <div className="flex flex-col gap-6 relative pl-12">
              {reversedTimeline.map((entry, idx) => (
                <div key={idx} className="flex items-start relative">
                  <div
                    className={`absolute -left-10 flex items-center justify-center w-8 h-8 rounded-full z-9 ${getStageColor(
                      entry.stage
                    )} shadow-md`}>
                    {getStageIcon(entry.stage)}
                  </div>

                  {/* Content section */}
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-lg">
                      {entry.stage.charAt(0).toUpperCase() +
                        entry.stage.slice(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.stageUpdatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {candidate.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes about the candidate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {candidate.notes.map((note, index) => (
                <div key={index} className="border-b border-muted py-2">
                  <p className="text-sm">{index + 1}. {(note.text)}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.date).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Write a Note</CardTitle>
          <CardDescription>
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
                {label: "Alice", value: "Alice"},
                {label: "Bob", value: "Bob"},
                {label: "Charlie", value: "Charlie"},
              ]}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loadingNote}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
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