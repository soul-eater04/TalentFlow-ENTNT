import Dexie from "dexie";
import { faker } from "@faker-js/faker";
// Create a new database
export const db = new Dexie("JobsDatabase");

// Define a version and the stores
db.version(1).stores({
  jobs: "id,title,slug,status,tags,postingDate,order",
  candidates: "id,name,jobId,email,stage,stageUpdatedAt",
  assessments: "id,jobId,name,questions",
  submissions: "id,jobId,assessmentId,submittedAt" 
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

const baseAssessments = [
  {
    name: "React Fundamentals",
    sections: [
      {
        id: "d9e7f5d4-a1b8-4c3e-8f12-2d9c4c5e8b6a",
        title: "Core Concepts",
        questions: [
          {
            id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
            question:
              "What is the difference between a functional component and a class component in React?",
            type: "short-text",
            required: true,
          },
          {
            id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
            question: "Which hook is used to manage state in functional components?",
            type: "single-choice",
            required: true,
            options: ["useState", "useEffect", "useReducer", "useMemo"],
          },
          {
            id: "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
            question: "What does the virtual DOM do in React?",
            type: "long-text",
            required: true,
          },
          {
            id: "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
            question: "Which of the following are valid React hooks?",
            type: "multi-choice",
            required: true,
            options: ["useState", "useFetch", "useContext", "useReducer"],
          },
          {
            id: "e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0",
            question:
              "In React, keys help identify which items have changed. Where should you add the key prop?",
            type: "single-choice",
            required: true,
            options: [
              "On the parent element",
              "On the element inside the loop",
              "On the outermost <div>",
              "It doesn’t matter",
            ],
          },
          {
            id: "f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1",
            question: "Explain the difference between props and state in React.",
            type: "long-text",
            required: true,
          },
          {
            id: "a7b8c9d0-e1f2-a3b4-c5d6-e7f8a9b0c1d2",
            question:
              "What will happen if you call setState twice in a row in a functional component?",
            type: "short-text",
            required: false,
          },
          {
            id: "b8c9d0e1-f2a3-b4c5-d6e7-f8a9b0c1d2e3",
            question:
              "Which hook is used for performing side effects in React?",
            type: "single-choice",
            required: true,
            options: ["useEffect", "useMemo", "useLayoutEffect", "useRef"],
          },
          {
            id: "c9d0e1f2-a3b4-c5d6-e7f8-a9b0c1d2e3f4",
            question: "What is JSX and why do we use it in React?",
            type: "short-text",
            required: true,
          },
          {
            id: "d0e1f2a3-b4c5-d6e7-f8a9-b0c1d2e3f4a5",
            question:
              "On a scale of 1-10, how confident are you with React fundamentals?",
            type: "numeric",
            required: true,
            minRange: 1,
            maxRange: 10,
          },
        ],
      },
    ],
  },
  {
    name: "Advanced React & Performance",
    sections: [
      {
        id: "e1f2g3h4-i5j6-k7l8-m9n0-o1p2q3r4s5t6",
        title: "Performance & Advanced Hooks",
        questions: [
          {
            id: "f2g3h4i5-j6k7-l8m9-n0o1-p2q3r4s5t6u7",
            question: "What is React.memo used for?",
            type: "short-text",
            required: true,
          },
          {
            id: "g3h4i5j6-k7l8-m9n0-o1p2-q3r4s5t6u7v8",
            question:
              "Which hook would you use for memoizing expensive calculations?",
            type: "single-choice",
            required: true,
            options: ["useEffect", "useMemo", "useCallback", "useReducer"],
          },
          {
            id: "h4i5j6k7-l8m9-n0o1-p2q3-r4s5t6u7v8w9",
            question: "What are React Suspense and Concurrent Mode used for?",
            type: "long-text",
            required: true,
          },
          {
            id: "i5j6k7l8-m9n0-o1p2-q3r4-s5t6u7v8w9x0",
            question:
              "Which techniques can improve performance in a React application?",
            type: "multi-choice",
            required: true,
            options: [
              "Code splitting",
              "Lazy loading",
              "Using useMemo and useCallback",
              "Avoiding keys in lists",
            ],
          },
          {
            id: "j6k7l8m9-n0o1-p2q3-r4s5-t6u7v8w9x0y1",
            question: "What’s the difference between useMemo and useCallback?",
            type: "short-text",
            required: true,
          },
          {
            id: "k7l8m9n0-o1p2-q3r4-s5t6-u7v8w9x0y1z2",
            question: "Explain how React’s reconciliation algorithm works (in short).",
            type: "long-text",
            required: false,
          },
          {
            id: "l8m9n0o1-p2q3-r4s5-t6u7-v8w9x0y1z2a3",
            question: "What does React.StrictMode do?",
            type: "short-text",
            required: true,
          },
          {
            id: "m9n0o1p2-q3r4-s5t6-u7v8-w9x0y1z2a3b4",
            question: "Which of the following are ways to optimize React rendering?",
            type: "multi-choice",
            required: true,
            options: [
              "Avoid inline functions",
              "Use React.memo",
              "Batch state updates",
              "Use many nested components",
            ],
          },
          {
            id: "n0o1p2q3-r4s5-t6u7-v8w9-x0y1z2a3b4c5",
            question: "What are controlled vs uncontrolled components in React?",
            type: "long-text",
            required: true,
          },
          {
            id: "o1p2q3r4-s5t6-u7v8-w9x0-y1z2a3b4c5d6",
            question:
              "On a scale of 1-10, rate your knowledge of React performance optimizations.",
            type: "numeric",
            required: true,
            minRange: 1,
            maxRange: 10,
          },
        ],
      },
    ],
  },
  {
    name: "Frontend Ecosystem & Testing",
    sections: [
      {
        id: "p2q3r4s5-t6u7-v8w9-x0y1-z2a3b4c5d6e7",
        title: "Testing & Ecosystem",
        questions: [
          {
            id: "q3r4s5t6-u7v8-w9x0-y1z2-a3b4c5d6e7f8",
            question: "What is the difference between unit testing and integration testing?",
            type: "short-text",
            required: true,
          },
          {
            id: "r4s5t6u7-v8w9-x0y1-z2a3-b4c5d6e7f8g9",
            question: "Which testing library is most commonly used with React?",
            type: "single-choice",
            required: true,
            options: ["Mocha", "React Testing Library", "Jest", "Vitest"],
          },
          {
            id: "s5t6u7v8-w9x0-y1z2-a3b4-c5d6e7f8g9h0",
            question:
              "Write an example of how you would test a button click using React Testing Library.",
            type: "long-text",
            required: true,
          },
          {
            id: "t6u7v8w9-x0y1-z2a3-b4c5-d6e7f8g9h0i1",
            question: "Which tools are commonly used for type safety in React?",
            type: "multi-choice",
            required: true,
            options: ["TypeScript", "PropTypes", "Flow", "Babel"],
          },
          {
            id: "u7v8w9x0-y1z2-a3b4-c5d6-e7f8g9h0i1j2",
            question: "What is the difference between E2E testing and integration testing?",
            type: "short-text",
            required: false,
          },
          {
            id: "v8w9x0y1-z2a3-b4c5-d6e7-f8g9h0i1j2k3",
            question: "How does tree-shaking help in optimizing frontend apps?",
            type: "short-text",
            required: true,
          },
          {
            id: "w9x0y1z2-a3b4-c5d6-e7f8-g9h0i1j2k3l4",
            question:
              "What is the role of Webpack or Vite in modern frontend development?",
            type: "long-text",
            required: true,
          },
          {
            id: "x0y1z2a3-b4c5-d6e7-f8g9-h0i1j2k3l4m5",
            question: "Which of the following tools/frameworks can be used for E2E testing?",
            type: "multi-choice",
            required: true,
            options: ["Cypress", "Playwright", "Selenium", "React Query"],
          },
          {
            id: "y1z2a3b4-c5d6-e7f8-g9h0-i1j2k3l4m5n6",
            question:
              "Explain why accessibility (a11y) is important in frontend development.",
            type: "long-text",
            required: true,
          },
          {
            id: "z2a3b4c5-d6e7-f8g9-h0i1-j2k3l4m5n6o7",
            question:
              "On a scale of 1-10, how experienced are you with testing React applications?",
            type: "numeric",
            required: true,
            minRange: 1,
            maxRange: 10,
          },
        ],
      },
    ],
  },
  {
    name: "State Management & Routing",
    sections: [
      {
        id: "1c2b3a4-d5e6-f7g8-h9i0-j1k2l3m4n5",
        title: "State Management",
        questions: [
          {
            id: "2d3e4f5g-h6i7-j8k9-l0m1-n2o3p4q5r6",
            question: "What is prop drilling and how can you avoid it?",
            type: "long-text",
            required: true,
          },
          {
            id: "3e4f5g6h-i7j8-k9l0-m1n2-o3p4q5r6s7",
            question: "When should you use the useContext hook?",
            type: "short-text",
            required: true,
          },
          {
            id: "4f5g6h7i-j8k9-l0m1-n2o3-p4q5r6s7t8",
            question: "Which of the following are popular state management libraries for React?",
            type: "multi-choice",
            required: true,
            options: ["Redux Toolkit", "Zustand", "Context API", "Axios"],
          },
          {
            id: "5g6h7i8j-k9l0-m1n2-o3p4-q5r6s7t8u9",
            question: "What is the primary purpose of Redux in a React application?",
            type: "short-text",
            required: true,
          },
          {
            id: "6h7i8j9k-l0m1-n2o3-p4q5-r6s7t8u9v0",
            question: "Explain the concept of 'immutability' in the context of state management.",
            type: "long-text",
            required: true,
          },
          {
            id: "7i8j9k0l-m1n2-o3p4-q5r6-s7t8u9v0w1",
            question: "Which of these is not a core principle of Redux?",
            type: "single-choice",
            required: true,
            options: [
              "Single source of truth",
              "State is read-only",
              "Changes are made with pure functions",
              "Mutations are encouraged for performance",
            ],
          },
          {
            id: "8j9k0l1m-n2o3-p4q5-r6s7-t8u9v0w1x2",
            question: "When would you choose `useReducer` over `useState`?",
            type: "short-text",
            required: true,
          },
        ],
      },
      {
        id: "a2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6",
        title: "Routing",
        questions: [
          {
            id: "b3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7",
            question: "How do you handle client-side routing in a single-page application (SPA)?",
            type: "short-text",
            required: true,
          },
          {
            id: "c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8",
            question:
              "Which library is the standard for routing in React applications?",
            type: "single-choice",
            required: true,
            options: ["Vue Router", "React Router", "Next.js", "Express.js"],
          },
          {
            id: "d5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9",
            question: "What is the purpose of the <BrowserRouter> component?",
            type: "short-text",
            required: true,
          },
          {
            id: "e6f7g8h9-i0j1-k2l3-m4n5-o6p7q8r9s0",
            question: "How do you pass data between different routes?",
            type: "long-text",
            required: true,
          },
          {
            id: "f7g8h9i0-j1k2-l3m4-n5o6-p7q8r9s0t1",
            question: "Explain the difference between <Link> and <a> tags in React Router.",
            type: "short-text",
            required: true,
          },
        ],
      },
    ],
  },
  {
    name: "Advanced Patterns & Architecture",
    sections: [
      {
        id: "u2v3w4x5-y6z7-a8b9-c0d1-e2f3g4h5i6",
        title: "Design Patterns",
        questions: [
          {
            id: "v3w4x5y6-z7a8-b9c0-d1e2-f3g4h5i6j7",
            question: "What is the Render Props pattern and when would you use it?",
            type: "long-text",
            required: true,
          },
          {
            id: "w4x5y6z7-a8b9-c0d1-e2f3-g4h5i6j7k8",
            question: "Explain the Higher-Order Component (HOC) pattern with a simple example.",
            type: "long-text",
            required: true,
          },
          {
            id: "x5y6z7a8-b9c0-d1e2-f3g4-h5i6j7k8l9",
            question: "What problem does the Compound Component pattern solve?",
            type: "short-text",
            required: true,
          },
          {
            id: "y6z7a8b9-c0d1-e2f3-g4h5-i6j7k8l9m0",
            question: "What's the difference between a custom hook and a regular function?",
            type: "short-text",
            required: true,
          },
        ],
      },
      {
        id: "z7a8b9c0-d1e2-f3g4-h5i6-j7k8l9m0n1",
        title: "Architectural Concepts",
        questions: [
          {
            id: "a8b9c0d1-e2f3-g4h5-i6j7-k8l9m0n1o2",
            question:
              "Explain the difference between Server-Side Rendering (SSR) and Client-Side Rendering (CSR).",
            type: "long-text",
            required: true,
          },
          {
            id: "b9c0d1e2-f3g4-h5i6-j7k8-l9m0n1o2p3",
            question: "What is the purpose of Next.js or other meta-frameworks?",
            type: "short-text",
            required: true,
          },
          {
            id: "c0d1e2f3-g4h5-i6j7-k8l9-m0n1o2p3q4",
            question: "What is 'hydration' in the context of React and SSR?",
            type: "short-text",
            required: true,
          },
          {
            id: "d1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5",
            question: "On a scale of 1-10, how comfortable are you with advanced React patterns and architecture?",
            type: "numeric",
            required: true,
            minRange: 1,
            maxRange: 10,
          },
        ],
      },
    ],
  },
];

export async function seedAssessments() {
  try {
    const count = await db.assessments.count();
    if (count > 0) {
      console.log("✅ Assessments already seeded.");
      return;
    }

    const jobs = await db.jobs.toArray();
    if (jobs.length === 0) {
      console.warn("⚠️ No jobs found. Seed jobs before assessments.");
      return;
    }

    const allAssessments = [];
    for (const job of jobs) {
      for (const template of baseAssessments) {
        allAssessments.push({
          id: faker.string.uuid(),
          jobId: job.id,
          name: template.name,
          sections: template.sections, // <-- added sections
        });
      }
    }

    await db.assessments.bulkAdd(allAssessments);
    console.log(`🌱 Seeded ${allAssessments.length} assessments for ${jobs.length} jobs.`);
  } catch (error) {
    console.error("❌ Error seeding assessments:", error);
  }
}