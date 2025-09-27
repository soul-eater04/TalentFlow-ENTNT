import Dexie from "dexie";

// Create a new database
export const db = new Dexie("JobsDatabase");

// Define a version and the stores
db.version(1).stores({
  jobs: "id,title,slug,status,tags,postingDate,order",
});


const mockJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    slug: "frontend-developer",
    description: "Build amazing UIs with React.",
    status: "active",
    postedBy: "John Doe",
    postingDate: new Date("2025-09-27"),
    vacancies: 2,
    location: "Remote",
    tags: ["react", "ui", "javascript"],
    priority: 1,
  },
  {
    id: 2,
    title: "Backend Engineer",
    slug: "backend-engineer",
    description: "Build scalable APIs.",
    status: "archived",
    postedBy: "Jane Smith",
    postingDate: new Date("2025-09-20"),
    vacancies: 1,
    location: "NYC",
    tags: ["node", "api", "express"],
    priority: 2,
  },
  // add more jobs
];

export async function seedJobs() {
  await db.jobs.clear(); // optional: clear existing jobs
  await db.jobs.bulkAdd(mockJobs);
  console.log("Database seeded with mock jobs.");
}
