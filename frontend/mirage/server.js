import { createServer , Response } from "miragejs";
import { db } from "./db";
import { faker } from "@faker-js/faker";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces → dashes
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "") // remove non-word chars
    .replace(/\-\-+/g, "-"); // collapse dashes
}

export function makeServer() {
  return createServer({
    routes() {
      this.namespace = "api";

      // GET /api/jobs
      this.get("/jobs", async (schema, request) => {
        console.log("request : ", request);
        const { search, status, page, pageSize } = request.queryParams;

        const searchParam = search || "";
        const statusParam = status || "";
        const pageParam = Number(page || 1);
        const pageSizeParam = Number(pageSize || 10);

        let collection = db.jobs.toCollection();
        console.log("Initial job collection:", await collection.toArray());
        if (searchParam) {
          collection = collection.filter((job) =>
            job.title.toLowerCase().includes(searchParam.toLowerCase())
          );
        }
        if (statusParam) {
          collection = collection.filter((job) => job.status === statusParam);
        }

        let allJobs = await collection.sortBy("order");
        allJobs = allJobs.reverse();

        const totalPages = Math.ceil(allJobs.length / pageSizeParam);
        const paginated = allJobs.slice(
          (pageParam - 1) * pageSizeParam,
          pageParam * pageSizeParam
        );

        return { jobs: paginated, totalPages };
      });

      // GET /api/jobs/:slug
      this.get("/jobs/:slug", async (schema, request) => {
        const { slug } = request.params;
        const job = await db.jobs.where("slug").equals(slug).first();
        if (!job) return new Response(404, {}, { error: "Job not found" });
        return job;
      });

      // POST /api/jobs (create/update)
      this.post("/jobs", async (schema, request) => {
        const attrs = JSON.parse(request.requestBody);

        // Get current max order & id
        const allJobs = await db.jobs.toArray();
        const maxOrder = allJobs.length
          ? Math.max(...allJobs.map((j) => j.order || 0))
          : 0;
        const maxId = allJobs.length
          ? Math.max(...allJobs.map((j) => j.id || 0))
          : 0;

        // Build new job
        const newJob = {
          id: maxId + 1,
          title: attrs.title,
          slug: slugify(attrs.title),
          status: attrs.status || "active",
          tags: attrs.tags || [],
          order: maxOrder + 1,
          description: attrs.description || "",
          postedBy: attrs.postedBy || "",
          location: attrs.location || "",
          vacancies: attrs.vacancies || 0,
          postingDate: attrs.postingDate || new Date().toISOString(),
        };

        // Save to IndexedDB via Dexie
        await db.jobs.add(newJob);

        return newJob;
      });

      // PATCH /api/jobs/:id
      this.patch("/jobs/:id", async (schema, request) => {
        const { id } = request.params;
        const attrs = JSON.parse(request.requestBody);
        const job = await db.jobs.get(id);
        
        if (!job) {
          return new Response(404, {}, { error: "Job not found" });
        }
        
        // Create update object with only the fields that changed
        const updates = {};
        
        if (attrs.title !== undefined) {
          updates.title = attrs.title;
          updates.slug = slugify(attrs.title);
        }
        if (attrs.status !== undefined) updates.status = attrs.status;
        if (attrs.tags !== undefined) updates.tags = attrs.tags;
        if (attrs.description !== undefined) updates.description = attrs.description;
        if (attrs.postedBy !== undefined) updates.postedBy = attrs.postedBy;
        if (attrs.location !== undefined) updates.location = attrs.location;
        if (attrs.vacancies !== undefined) updates.vacancies = attrs.vacancies;
        if (attrs.postingDate !== undefined) updates.postingDate = attrs.postingDate;
        console.log("Updates object:", updates);
        await db.jobs.update(job.id, updates);
        
        // Fetch and return the updated job
        const updatedJob = await db.jobs.get(job.id);
        return { job: updatedJob };
      });

      // PATCH /api/jobs/:id/reorder
      this.patch("/jobs/:id/reorder", async (schema, request) => {
        // Simulate random server error 20% of the time
        const rand = Math.random();
        if (rand < 0.2) {
          return new Response(500, {}, { error: "Random server error. Please try again." });
        }

        const { id } = request.params;
        const { fromOrder, toOrder } = JSON.parse(request.requestBody);

        const job = await db.jobs.get(Number(id));
        if (!job) {
          return new Response(404, {}, { error: "Job not found" });
        }

        if (fromOrder < toOrder) {
          // Move down → shift jobs in (fromOrder, toOrder] up by -1
          await db.jobs
            .where("order")
            .between(fromOrder + 1, toOrder, true, true)
            .modify((j) => {
              j.order = j.order - 1;
            });
        } else if (fromOrder > toOrder) {
          // Move up → shift jobs in [toOrder, fromOrder) down by +1
          await db.jobs
            .where("order")
            .between(toOrder, fromOrder - 1, true, true)
            .modify((j) => {
              j.order = j.order + 1;
            });
        }

        // Finally update the dragged job itself
        await db.jobs.update(job.id, { order: toOrder });

        const updatedJob = await db.jobs.get(job.id);
        return updatedJob;
      });

      this.get("/candidates", async (schema, request) => {
        console.log("request : ", request);
        const { stage, page } = request.queryParams;
        const stageParam = stage || "";
        const pageParam = Number(page || 1);
        const pageSizeParam = 50; // fixed page size
        let collection = db.candidates.toCollection();
        console.log("Initial candidate collection:", await collection.toArray());
        if (stageParam) {
          collection = collection.filter((c) => c.stage === stageParam);
        }
        let allCandidates = await collection.sortBy("stageUpdatedAt");
        allCandidates = allCandidates.reverse();
        const totalPages = Math.ceil(allCandidates.length / pageSizeParam);
        const paginated = allCandidates.slice(
          (pageParam - 1) * pageSizeParam,
          pageParam * pageSizeParam
        );
        return {paginated, totalPages};
      });

      this.get("/candidates/:id/timeline", async (schema, request) => {
        const { id } = request.params;
        const candidate = await db.candidates.get(id);
        if (!candidate) return new Response(404, {}, { error: "Candidate not found" });
        return candidate;
      });

      this.get("/candidates/:jobid", async (schema, request) => {
        const jobId = request.params.jobid;

        try {
          const candidates = await db.candidates.where("jobId").equals(jobId).toArray();
          return { candidates };
        } catch (error) {
          console.error("❌ Error fetching candidates:", error);
          return { candidates: [] };
        }
      });

      this.patch("/candidates/:id", async (schema, request) => {
        const { id } = request.params;
        const attrs = JSON.parse(request.requestBody);
        const { stage, stageUpdatedAt } = attrs;
        
        try {
          const candidate = await db.candidates.get(id);
          if (!candidate) {
            return new Response(404, {}, { error: "Candidate not found" });
          }
          if(stage === candidate.stage) {
            throw new Error("Stage is the same as current stage");
          }

          // Update stage
          candidate.stage = stage;

          // Append to timeline
          if (!Array.isArray(candidate.timeline)) {
            candidate.timeline = [];
          }
          candidate.timeline.push({ stage, stageUpdatedAt });

          // Save back to Dexie
          await db.candidates.put(candidate);

          return { candidate };
        } catch (error) {
          console.error("❌ Failed to update candidate:", error);
          return new Response(500, {}, { error: "Failed to update candidate" });
        }
      });

      this.put("/candidates/:id", async (schema, request) => {
        const { id } = request.params;
        const attrs = JSON.parse(request.requestBody);
        const { note } = attrs;
        if (!note || !note.trim()) {
          return new Response(400, {}, { error: "Note cannot be empty" });
        }
        try {
          const candidate = await db.candidates.get(id);
          if (!candidate) {
            return new Response(404, {}, { error: "Candidate not found" });
          }
          candidate.notes = candidate.notes || [];
          candidate.notes.push({
            text: note,
            date: new Date().toISOString(),
          });
          await db.candidates.put(candidate);
          return { candidate };
        } catch (error) {
          console.error("❌ Failed to update candidate:", error);
          return new Response(500, {}, { error: "Failed to update candidate" });
        }
      });

      this.post("/candidates", async (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const newCandidate = {
          id: faker.string.uuid(),
          name: attrs.name,
          email: attrs.email,
          phone: faker.phone.number(),
          location: faker.location.city(),
          jobId: attrs.jobId,
          stage: "applied",
          stageUpdatedAt: new Date().toISOString(),
          timeline: [
            {
              stage: "applied",
              stageUpdatedAt: new Date().toISOString(),
            },
          ],
        };
        await db.candidates.add(newCandidate);
        return { candidate: newCandidate };
      });
      
      this.get("/assessments/:jobId", async (schema, request) => {
        const { jobId } = request.params;
        try {
          const assessments = await db.assessments.where("jobId").equals(jobId).toArray();
          return assessments;
        } catch (error) {
          console.error("❌ Error fetching assessments:", error);
          return { assessments: [] };
        }
      });

      this.post("/assessments/:jobId", (schema, request) => {
        const { jobId } = request.params;
        const attrs = JSON.parse(request.requestBody);

        // Create a new assessment entry
        const newAssessment = {
          id: faker.string.uuid(),
          jobId,
          name: faker.person.fullName() + " Assessment",
          ...attrs // include sections/questions structure from request body
        };

        // Save to Mirage DB
        db.assessments.add(newAssessment);

        return { assessment: newAssessment };
      });

      this.post("/assessment/:jobId/submit", (schema, request) => {
        try {
          const jobId = request.params.jobId;
          const attrs = JSON.parse(request.requestBody);

          const submission = schema.db.submissions.insert({
            id: faker.string.uuid(), // unique id
            jobId,
            assessmentId: attrs.assessmentId || null,
            responses: attrs.responses || [],
            submittedAt: attrs.submittedAt || new Date().toISOString(),
          });

          return { success: true, submission };
        } catch (error) {
          return new Response(
            400,
            {},
            { error: "Failed to save submission", details: error.message }
          );
        }
      });
    },
  });
}
