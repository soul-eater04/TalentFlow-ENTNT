// src/mirage/server.js
import { createServer } from "miragejs";
import { db } from "./db";

export function makeServer() {
  return createServer({
    routes() {
      this.namespace = "api";

      // GET /api/jobs
      this.get("/jobs", async (request) => {
        const url = new URL(request.url, window.location.origin);

        const search = url.searchParams.get("search") || "";
        const status = url.searchParams.get("status") || "";
        const page = Number(url.searchParams.get("page") || 1);
        const pageSize = Number(url.searchParams.get("pageSize") || 10);

        let collection = db.jobs.toCollection();
        console.log("Initial job collection:", await collection.toArray());
        if (search) {
            collection = collection.filter(job =>
            job.title.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (status) {
            collection = collection.filter(job => job.status === status);
        }

        let allJobs = await collection.sortBy("postingDate");
        allJobs = allJobs.reverse();

        const totalPages = Math.ceil(allJobs.length / pageSize);
        const paginated = allJobs.slice((page - 1) * pageSize, page * pageSize);

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
        await db.jobs.put(attrs); // insert or update
        return attrs;
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
