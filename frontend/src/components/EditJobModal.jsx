import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from "axios";

export function EditJobModal({ job, open, onClose, fetchJobs }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("active");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [postedBy, setPostedBy] = useState("");
  const [location, setLocation] = useState("");
  const [vacancies, setVacancies] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate form when job changes
  useEffect(() => {
    if (job) {
      setTitle(job.title || "");
      setStatus(job.status || "active");
      setTags(job.tags?.join(", ") || "");
      setDescription(job.description || "");
      setPostedBy(job.postedBy || "");
      setLocation(job.location || "");
      setVacancies(job.vacancies ? String(job.vacancies) : "");
    }
  }, [job]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await axios.patch(`/api/jobs/${job.id}`, {
        title,
        status,
        tags: tagArray,
        description: description || undefined,
        postedBy: postedBy || undefined,
        location: location || undefined,
        vacancies: vacancies ? Number(vacancies) : undefined,
      });

      await fetchJobs();
      onClose();
    } catch (err) {
      console.error("Failed to update job:", err);
      alert("Failed to update job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Edit Job
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Fields marked with <span className="text-red-500">*</span> are
            required.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          {/* Title */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Status */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300">
              Status <span className="text-red-500">*</span>
            </Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 rounded w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short job description"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Posted By */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Posted By</Label>
            <Input
              value={postedBy}
              onChange={(e) => setPostedBy(e.target.value)}
              placeholder="Recruiter's name"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Location */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote, New York"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Vacancies */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Vacancies</Label>
            <Input
              type="number"
              value={vacancies}
              onChange={(e) => setVacancies(e.target.value)}
              placeholder="e.g. 3"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Tags */}
          <div>
            <Label className="text-gray-700 dark:text-gray-300">
              Tags (comma-separated)
            </Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. react, frontend"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}