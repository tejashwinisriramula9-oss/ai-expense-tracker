import { useState } from 'react'
import api from '../api/axiosConfig'
import toast from 'react-hot-toast'

const starterQuestions = [
  'How much did I spend this month?',
  'Which category has highest expenses?',
  'Give me saving suggestions.',
  'Predict my next month spending.',
]

export default function ChatbotPanel() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)

  const askQuestion = async (query) => {
    const payload = { question: query }
    setLoading(true)
    try {
      const response = await api.post('/ai-insights/query', payload)
      setAnswer(response.data)
      toast.success('AI insight generated')
    } catch (error) {
      toast.error('Could not fetch insight')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">AI financial assistant</p>
      <h3 className="mt-3 text-xl font-semibold text-white">Ask your money coach</h3>
      <div className="mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {starterQuestions.map((text) => (
            <button
              key={text}
              onClick={() => askQuestion(text)}
              className="rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-indigo-500 hover:text-white"
            >
              {text}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none"
            placeholder="Ask your financial assistant anything..."
            rows={4}
          />
          <button
            onClick={() => askQuestion(question)}
            disabled={loading || !question.trim()}
            className="rounded-3xl bg-gradient-to-r from-indigo-500 to-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Thinking...' : 'Get Insight'}
          </button>
        </div>
        {answer && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-sm text-slate-300">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">AI response</p>
            <p className="mt-3 text-white">{answer.insight}</p>
            <ul className="mt-4 space-y-2 list-disc pl-5 text-slate-300">
              {answer.recommendations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
