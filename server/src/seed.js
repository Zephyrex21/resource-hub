// Seeds the database with real starter content so the API and (later) the UI
// have something genuine to render instead of "Lorem ipsum" placeholders.
//
// Notes/Tips still point at placeholder fileUrls — swap those for real
// Supabase Storage / Cloudinary links once file upload is wired up (Phase 3).
// Project URLs are best-effort based on known repo naming — double-check
// each githubUrl/liveUrl against your actual GitHub before deploying.

import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import Note from './models/Note.js'
import Tip from './models/Tip.js'
import Project from './models/Project.js'

const notes = [
  {
    title: 'DBMS Fundamentals — Normalization & ER Modeling',
    slug: 'dbms-fundamentals-normalization-er-modeling',
    subject: 'DBMS',
    tags: ['dbms', 'normalization', 'sql'],
    description:
      'Core relational database concepts: ER diagrams, normal forms (1NF–BCNF), and keys — condensed for quick revision.',
    // Local test file (served by the client's Vite dev server at :5173) so the
    // in-browser PDF viewer is actually testable end-to-end in Phase 2.
    // Swap for a real Supabase Storage / Cloudinary URL once uploads exist (Phase 3).
    fileUrl: 'http://localhost:5173/sample-note.pdf',
    fileType: 'pdf',
    difficulty: 'beginner',
  },
  {
    title: 'Operating Systems — Process Scheduling & Deadlocks',
    slug: 'os-process-scheduling-deadlocks',
    subject: 'OS',
    tags: ['os', 'scheduling', 'deadlock'],
    description:
      "Scheduling algorithms (FCFS, SJF, Round Robin), deadlock conditions, and a Banker's Algorithm walkthrough.",
    fileUrl: 'https://example.com/notes/os-scheduling.pdf',
    fileType: 'pdf',
    difficulty: 'intermediate',
  },
  {
    title: 'LLMs & RAG — How Retrieval-Augmented Generation Works',
    slug: 'llms-rag-how-it-works',
    subject: 'LLMs',
    tags: ['llm', 'rag', 'embeddings', 'vector-db'],
    description:
      'Chunking, embeddings, vector search, and the retrieval-then-generate pipeline — plus common failure modes.',
    fileUrl: 'https://example.com/notes/rag-explained.pdf',
    fileType: 'pdf',
    difficulty: 'intermediate',
  },
  {
    title: 'DSA — Trees, Graphs & Traversals Cheat Sheet',
    slug: 'dsa-trees-graphs-traversals',
    subject: 'DSA',
    tags: ['dsa', 'trees', 'graphs'],
    description: 'BFS/DFS, tree traversals, and when to reach for each — with complexity notes.',
    fileUrl: 'https://example.com/notes/dsa-trees-graphs.pdf',
    fileType: 'pdf',
    difficulty: 'beginner',
  },
]

const tips = [
  {
    title: 'Install & Configure Docker on Ubuntu',
    slug: 'install-configure-docker-ubuntu',
    category: 'Docker',
    tags: ['docker', 'linux', 'setup'],
    summary:
      'A clean install of Docker Engine on Ubuntu, plus the post-install steps people usually forget.',
    contentMarkdown: `## Install Docker Engine

\`\`\`bash
curl -fsSL https://get.docker.com | sh
\`\`\`

## Run Docker without sudo

\`\`\`bash
sudo usermod -aG docker $USER
newgrp docker
\`\`\`

## Enable Docker on boot

\`\`\`bash
sudo systemctl enable docker
\`\`\`

## Verify it worked

\`\`\`bash
docker run hello-world
\`\`\`
`,
  },
  {
    title: 'Fix "Permission Denied" on Git Push over SSH',
    slug: 'fix-git-push-ssh-permission-denied',
    category: 'Git',
    tags: ['git', 'ssh'],
    summary: "The usual cause is a missing or unloaded SSH key — here's the full checklist.",
    contentMarkdown: `## Checklist

1. Confirm a key exists:
   \`\`\`bash
   ls -al ~/.ssh
   \`\`\`
2. Add it to the SSH agent:
   \`\`\`bash
   ssh-add ~/.ssh/id_ed25519
   \`\`\`
3. Test the connection:
   \`\`\`bash
   ssh -T git@github.com
   \`\`\`
4. Make sure the public key is added under GitHub → Settings → SSH and GPG keys.
`,
  },
]

const projects = [
  {
    title: 'Vision Interpretability Studio',
    slug: 'vision-interpretability-studio',
    description:
      'A fully client-side neural network interpretability tool — Grad-CAM, FGSM, and Occlusion Sensitivity, running entirely in-browser via ONNX Runtime Web and TF.js.',
    techStack: ['React', 'TypeScript', 'Vite', 'ONNX Runtime Web', 'TF.js', 'Framer Motion'],
    githubUrl: 'https://github.com/Zephyrex21/vision-interpretability-studio',
    liveUrl: 'https://vision-interpretability-studio.vercel.app',
    status: 'active',
    featured: true,
  },
  {
    title: 'AllowOrigin',
    slug: 'alloworigin',
    description:
      'A zero-backend CORS error fixer: parses your actual browser error, identifies the cause, and generates fix snippets for 9+ frameworks.',
    techStack: ['React', 'Vite', 'TypeScript', 'Framer Motion'],
    githubUrl: 'https://github.com/Zephyrex21/AllowOrigin',
    liveUrl: 'https://alloworigin.dev',
    status: 'completed',
    featured: true,
  },
  {
    title: 'Automata Visualizer',
    slug: 'automata-visualizer',
    description:
      'An interactive visualizer for Theory of Automata concepts — DFA/NFA construction and step-by-step simulation.',
    techStack: ['JavaScript', 'HTML5', 'CSS3'],
    githubUrl: 'https://github.com/Zephyrex21/Automata-Visualizer',
    liveUrl: null,
    status: 'completed',
    featured: false,
  },
  {
    title: 'Red-Black Tree Visualizer',
    slug: 'red-black-tree-visualizer',
    description:
      'An animated Red-Black Tree visualizer showing rotations and recoloring step by step as nodes are inserted or deleted.',
    techStack: ['JavaScript', 'HTML5', 'CSS3'],
    githubUrl: 'https://github.com/Zephyrex21/RBT_Visualizer',
    liveUrl: null,
    status: 'completed',
    featured: false,
  },
  {
    title: 'Urban Heat MVP',
    slug: 'urban-heat-mvp',
    description:
      'AI-powered urban heat island analysis across 13 Indian cities — XGBoost + SHAP on the backend, Deck.gl + MapLibre for spatial visualization.',
    techStack: ['FastAPI', 'XGBoost', 'SHAP', 'GeoPandas', 'React', 'Deck.gl', 'MapLibre'],
    githubUrl: 'https://github.com/Zephyrex21/urban-heat-mitigation',
    liveUrl: null,
    status: 'completed',
    featured: false,
  },
  {
    title: 'Cryptex — File Sharing',
    slug: 'cryptex-file-sharing',
    description: 'A MERN-stack encrypted file sharing app using Supabase Storage for uploads.',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Supabase Storage'],
    githubUrl: 'https://github.com/Zephyrex21/Cryptex_File_Sharing',
    liveUrl: null,
    status: 'completed',
    featured: false,
  },
]

async function seed() {
  await connectDB()

  if (mongoose.connection.readyState !== 1) {
    console.error('[seed] No database connection — check MONGODB_URI in server/.env')
    process.exit(1)
  }

  await Promise.all([Note.deleteMany({}), Tip.deleteMany({}), Project.deleteMany({})])

  await Note.insertMany(notes)
  await Tip.insertMany(tips)
  await Project.insertMany(projects)

  console.log(
    `[seed] Inserted ${notes.length} notes, ${tips.length} tips, ${projects.length} projects`,
  )

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})
