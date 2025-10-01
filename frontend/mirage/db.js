import Dexie from "dexie";
import { faker } from "@faker-js/faker";
// Create a new database
export const db = new Dexie("JobsDatabase");

// Define a version and the stores
db.version(1).stores({
  jobs: "id,title,slug,status,tags,postingDate,order",
  candidates: "id,name,jobId,email,stage,stageUpdatedAt",
  assessments: "id,jobId,name,questions",
});

function generateMockJobs(count = 100) {
  const statuses = ["active", "archived"];
  const locations = ["Remote", "NYC", "SF", "London", "Berlin"];
  
  return Array.from({ length: count }).map((_, index) => {
    const title = faker.person.jobTitle();
    const slug = faker.helpers.slugify(title.toLowerCase());

    return {
      id: faker.string.uuid(),
      title,
      slug,
      description: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(statuses),
      postedBy: faker.person.fullName(),
      postingDate: faker.date.recent({ days: 30 }),
      vacancies: faker.number.int({ min: 1, max: 10 }),
      location: faker.helpers.arrayElement(locations),
      tags: faker.helpers.arrayElements(
        ["react", "node", "typescript", "api", "ui", "sql", "docker", "aws"],
        { min: 2, max: 5 }
      ),
      order: index + 1, // keeps order predictable
    };
  });
}

export async function seedJobs() {
  try {
    const count = await db.jobs.count();
    if (count > 0) {
      console.log("✅ Jobs already seeded.");
      return;
    }

    const mockJobs = generateMockJobs(50); // e.g. 50 jobs

    await db.jobs.bulkAdd(mockJobs);
    console.log(`🌱 Seeded ${mockJobs.length} jobs.`);
  } catch (error) {
    console.error("❌ Error seeding jobs:", error);
  }
}

async function generateMockCandidates(count = 1000) {
  const stages = [
    "applied",
    "screening",
    "technical",
    "offer",
    "hired",
    "rejected",
  ];

  const jobs = await db.jobs.toArray();
  if (jobs.length === 0) {
    throw new Error("⚠️ No jobs found in DB. Seed jobs before candidates.");
  }

  return Array.from({ length: count }).map(() => {
    const timeline = [];
    let currentStage = faker.helpers.arrayElement(stages);

    // First stage
    let date = faker.date.past({ years: 1 });
    timeline.push({
      stage: "applied",
      stageUpdatedAt: date.toISOString(),
    });

    // Progress through stages
    for (let i = 1; i < stages.length; i++) {
      const nextStage = stages[i];
      if (faker.datatype.boolean() && nextStage !== currentStage) {
        date = faker.date.between({ from: date, to: new Date() });
        timeline.push({
          stage: nextStage,
          stageUpdatedAt: date.toISOString(),
        });
        currentStage = nextStage;
      } else {
        break;
      }
    }

    const randomJob = faker.helpers.arrayElement(jobs);

    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      stage: timeline[timeline.length - 1].stage,
      phone: faker.phone.number(),
      location: faker.location.city(),
      jobId: randomJob.id, // jobId stored
      timeline,
      notes : [
        {
          text: faker.lorem.sentence(),
          date: faker.date.between({ from: timeline[0].stageUpdatedAt, to: new Date() }).toISOString(),
        },
      ],
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

    const mockCandidates = await generateMockCandidates(1000);
    await db.candidates.bulkAdd(mockCandidates);
    console.log(`🌱 Seeded ${mockCandidates.length} candidates.`);
  } catch (error) {
    console.error("❌ Error seeding candidates:", error);
  }
}