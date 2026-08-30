import { Router } from 'express'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import Note from '../models/Note.js'
import Tip from '../models/Tip.js'
import { createQuizController } from '../controllers/quizController.js'
import { createExplainController } from '../controllers/explainController.js'
import { askLimiter } from '../middleware/rateLimiters.js'
import { extractTextFromFile } from '../utils/extractText.js'
import { getSourceText as getSourceTextBase } from '../utils/getSourceText.js'

const router = Router()

// Real pdf-parse/mammoth are wired in only at this integration boundary —
// extractText.js and getSourceText.js themselves take these as injected
// dependencies, which is what makes their own unit tests possible without
// a real network call or real PDF/DOCX parsing.
function extractFn(fileUrl, fileType) {
  return extractTextFromFile(fileUrl, fileType, { pdfParse, mammothExtract: mammoth.extractRawText })
}

function getSourceText(doc, Model) {
  return getSourceTextBase(doc, Model, extractFn)
}

const quizCtrl = createQuizController({ Note, Tip, getSourceText })
const explainCtrl = createExplainController({ Note, Tip, getSourceText })

// Shares askLimiter with /api/v1/ask — same underlying concern (protecting
// Groq API usage from abuse) rather than two unrelated security domains,
// unlike admin vs. account auth, which deliberately do NOT share a limiter
// (see accountAuthLimiter's comment in rateLimiters.js for why that
// distinction matters).
router.get('/quiz/:contentType/:slug', askLimiter, quizCtrl.getOrGenerateQuiz)
router.post('/explain/:contentType/:slug', askLimiter, explainCtrl.explainDifferently)

export default router
