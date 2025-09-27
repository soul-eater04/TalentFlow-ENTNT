import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from "axios";

export function CreateJobModal({ fetchJobs }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("active");
  const [tags, setTags] = useState("");

  // optional fields
  const [description, setDescription] = useState("");
  const [postedBy, setPostedBy] = useState("");
  const [location, setLocation] = useState("");
  const [vacancies, setVacancies] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await axios.post("/api/jobs", {
        title,
        status,
        tags: tagArray,
        description: description || undefined,
        postedBy: postedBy || undefined,
        location: location || undefined,
        vacancies: vacancies ? Number(vacancies) : undefined,
        postingDate: new Date().toISOString(),
      });

      await fetchJobs(); // refresh list
      setOpen(false);

      // reset form
      setTitle("");
      setStatus("active");
      setTags("");
      setDescription("");
      setPostedBy("");
      setLocation("");
      setVacancies("");
    } catch (err) {
      console.error("Failed to create job:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">New Job</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Job</DialogTitle>
          <DialogDescription>
            Fields marked with <span className="text-red-500">*</span> are
            required.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          {/* Title */}
          <div>
            <Label>
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <Label>
              Status <span className="text-red-500">*</span>
            </Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Description (optional) */}
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short job description"
            />
          </div>

          {/* Posted By (optional) */}
          <div>
            <Label>Posted By</Label>
            <Input
              value={postedBy}
              onChange={(e) => setPostedBy(e.target.value)}
              placeholder="Recruiter's name"
            />
          </div>

          {/* Location (optional) */}
          <div>
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote, New York"
            />
          </div>

          {/* Vacancies (optional, number) */}
          <div>
            <Label>Vacancies</Label>
            <Input
              type="number"
              value={vacancies}
              onChange={(e) => setVacancies(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. react, frontend"
            />
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full">
            Create Job
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
