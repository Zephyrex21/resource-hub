// Seeds the database with real Projects data from your GitHub.
//
// Deliberately does NOT touch Notes or Tips — those are now live content
// (managed via the admin panel and `npm run import-notes`), and a
// deleteMany+insertMany cycle here would wipe real uploaded notes every
// time this script runs. Projects are safe to fully reseed since they're
// meant to mirror your GitHub portfolio as a whole, not accumulate
// independently.
//
// Re-run any time your GitHub projects change: `npm run seed`.

import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import Project from './models/Project.js'

// Verified against github.com/Zephyrex21 — 6 repos confirmed directly
// (GitHub's repositories tab blocks automated access, so this isn't
// necessarily your full list). Ordered highest-priority first; edit the
// `order` field (or use the admin panel) to rearrange later.
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
    order: 1,
  },
  {
    title: 'Urban Heat Mitigation',
    slug: 'urban-heat-mitigation',
    description:
      'Optimizing urban heat mitigation and cooling strategies via AI/ML — XGBoost + SHAP for prediction and explainability, Deck.gl + MapLibre for spatial visualization across 13 Indian cities.',
    techStack: ['Python', 'FastAPI', 'XGBoost', 'SHAP', 'GeoPandas', 'React', 'Deck.gl', 'MapLibre'],
    githubUrl: 'https://github.com/Zephyrex21/urban-heat-mitigation',
    liveUrl: null,
    status: 'completed',
    featured: true,
    order: 2,
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
    order: 3,
  },
  {
    title: 'Cryptex — File Sharing',
    slug: 'cryptex-file-sharing',
    description: 'A secure, token-based file sharing platform built with the MERN stack and Supabase Storage.',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Supabase Storage'],
    githubUrl: 'https://github.com/Zephyrex21/Cryptex_File_Sharing',
    liveUrl: null,
    status: 'completed',
    featured: false,
    order: 4,
  },
  {
    title: 'Automata Visualizer',
    slug: 'automata-visualizer',
    description:
      'A web-based Automata Lab for visualizing and simulating NFA, DFA, and model conversions — making TAFL concepts interactive and intuitive.',
    techStack: ['JavaScript', 'HTML5', 'CSS3'],
    githubUrl: 'https://github.com/Zephyrex21/Automata-Visualizer',
    liveUrl: 'https://automata-lab.netlify.app',
    status: 'completed',
    featured: false,
    order: 5,
  },
  {
    title: 'Red-Blackify — Red-Black Tree Visualizer',
    slug: 'red-black-tree-visualizer',
    description:
      'An interactive tool for demystifying Red-Black Trees — see how insertions trigger automatic rebalancing through color changes and rotations.',
    techStack: ['JavaScript', 'HTML5', 'CSS3'],
    githubUrl: 'https://github.com/Zephyrex21/RBT_Visualizer',
    liveUrl: 'https://rbt-visualizer.netlify.app',
    status: 'completed',
    featured: false,
    order: 6,
  },
]

async function seed() {
  await connectDB()

  if (mongoose.connection.readyState !== 1) {
    console.error('[seed] No database connection — check MONGODB_URI in server/.env')
    process.exit(1)
  }

  await Project.deleteMany({})
  await Project.insertMany(projects)

  console.log(`[seed] Inserted ${projects.length} projects. Notes and Tips were not touched.`)

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})
