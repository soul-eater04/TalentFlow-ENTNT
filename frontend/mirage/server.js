// src/mirage/server.js
import { createServer } from "miragejs";
import { db } from "./db";

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
      this.get("/jobs", async (schema ,request) => {
        console.log("request : ", request)
        const { search, status, page, pageSize } = request.queryParams;

        const searchParam = search || "";
        const statusParam = status || "";
        const pageParam = Number(page || 1);
        const pageSizeParam = Number(pageSize || 10);

        let collection = db.jobs.toCollection();
        console.log("Initial job collection:", await collection.toArray());
        if (searchParam) {
            collection = collection.filter(job =>
            job.title.toLowerCase().includes(searchParam.toLowerCase())
            );
        }
        if (statusParam) {
            collection = collection.filter(job => job.status === statusParam);
        }

        let allJobs = await collection.sortBy("order");
        allJobs = allJobs.reverse();

        const totalPages = Math.ceil(allJobs.length / pageSizeParam);
        const paginated = allJobs.slice((pageParam - 1) * pageSizeParam, pageParam * pageSizeParam);

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

      // DELETE /api/jobs/:id
      this.delete("/jobs/:id", async (schema, request) => {
        const id = Number(request.params.id);
        await db.jobs.delete(id);
        return { success: true };
      });
    },
  });
}
