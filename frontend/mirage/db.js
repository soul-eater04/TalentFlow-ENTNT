import Dexie from "dexie";
import { faker } from "@faker-js/faker";
// Create a new database
export const db = new Dexie("JobsDatabase");

// Define a version and the stores
db.version(1).stores({
  jobs: "id,title,slug,status,tags,postingDate,order",
  candidates: "id,name,email,stage,stageUpdatedAt",
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
    order: 1,
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
    order: 2,
  },
];

export async function seedJobs() {
  // await db.jobs.clear(); // optional: clear existing jobs
  try {
    const count = await db.jobs.count();
    if (count > 0) {
      console.log("Database already seeded.");
      return;
    }
    await db.jobs.bulkAdd(mockJobs);
    console.log("Database seeded with mock jobs.");
  } catch (error) {
    console.error("Error seeding jobs:", error);
  }
}

// Generate mock candidates
function generateMockCandidates(count = 1000) {
  const stages = [
    "applied",
    "screening",
    "technical",
    "offer",
    "hired",
    "rejected",
  ];

  return Array.from({ length: count }).map(() => {
    const timeline = [];
    let currentStage = faker.helpers.arrayElement(stages);
    
    // Create a chronological timeline
    let date = faker.date.past({ years: 1 });
    timeline.push({
      stage: "applied",
      stageUpdatedAt: date.toISOString(),
    });

    // Add subsequent stages with increasing dates
    for (let i = 1; i < stages.length; i++) {
      const nextStage = stages[i];
      // Only add subsequent stages if the candidate progressed
      if (faker.datatype.boolean() && nextStage !== currentStage) {
        date = faker.date.between({ from: date, to: new Date() });
        timeline.push({
          stage: nextStage,
          stageUpdatedAt: date.toISOString(),
        });
        currentStage = nextStage;
      } else {
        // If they didn't progress, they are at their current stage
        break; 
      }
    }

    // Set the final stage based on the last entry in the timeline
    const finalStage = timeline[timeline.length - 1].stage;
    
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      stage: finalStage, // Current stage is the last one in the timeline
      phone: faker.phone.number(),
      location: faker.location.city(),
      timeline: timeline, // This is the new array
    };
  });
}

export async function seedCandidates() {
  try {
    const count = await db.candidates.count();
    if (count > 0) {
      console.log("✅ Candidates already seeded.");
      return;
    }

    const mockCandidates = generateMockCandidates(1000);

    await db.candidates.bulkAdd(mockCandidates);
    console.log(`🌱 Seeded ${mockCandidates.length} candidates.`);
  } catch (error) {
    console.error("❌ Error seeding candidates:", error);
  }
} 