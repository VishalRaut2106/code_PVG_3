'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, TestTube, Lightbulb, History } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAuth } from '@/components/auth/AuthProvider'

// Components
import { Tabs } from './components/Tabs'
import { EditorHeader } from './components/EditorHeader'
import { ResultsDrawer } from './components/ResultsDrawer'

// Monaco Editor dynamic import
const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

interface TestCase {
  id: number
  input: string
  expected: string
  yourOutput?: string
  status?: 'pass' | 'fail' | 'pending' | 'running'
  runtime?: string
  memory?: string
  hidden?: boolean
}

interface Problem {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  description: string
  isSolved?: boolean
  constraints?: string[]
  topics?: string[]
  tags?: string[]
  examples: Array<{
    input: string
    output: string
    explanation: string
  }>
  testCases: TestCase[]
  providedPhoto?: string[]
  submissions?: Array<{
    submissionId: string
    name: string
    year?: string
    branch?: string
    email?: string
    language?: string
  }>
}

type Language = 'Python' | 'Java' | 'C++' | 'C'

const LANGUAGE_TEMPLATES = {
  'Python': {
    code: `class Solution:
    def twoSum(self, nums, target):
        # TODO: Implement
        return [0, 0]
`,
    fileName: 'Solution.py'
  },
  'Java': {
    code: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // TODO: Implement
        return new int[]{0,0};
    }
}
`,
    fileName: 'Solution.java'
  },
  'C++': {
    code: `class Solution{
public:
    vector<int> twoSum(const vector<int>& nums, int target){
        // TODO: Implement
        return {0,0};
    }
};
`,
    fileName: 'main.cpp'
  },
  'C': {
    code: `#include <stdlib.h>
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // TODO: Implement
    *returnSize = 2;
    int* ans = (int*)malloc(2 * sizeof(int));
    ans[0] = 0; ans[1] = 0;
    return ans;
}
`,
    fileName: 'main.c'
  },
}

export default function IDEPage({ params }: { params: { slug: string } }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('description')
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof LANGUAGE_TEMPLATES>('Python')
  const [editorTheme, setEditorTheme] = useState('vs-dark')
  const [code, setCode] = useState(LANGUAGE_TEMPLATES['Python'].code)
  const [originalCode, setOriginalCode] = useState(LANGUAGE_TEMPLATES['Python'].code)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [testResults, setTestResults] = useState<TestCase[]>([])
  const [leftPanelWidth, setLeftPanelWidth] = useState(45)
  const [isResizing, setIsResizing] = useState(false)
  const [executionProgress, setExecutionProgress] = useState({ current: 0, total: 0 })
  const [consoleLogs, setConsoleLogs] = useState<string[]>([])
  const [resultsHeight, setResultsHeight] = useState(300)
  const [isResizingResults, setIsResizingResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [backendTemplates, setBackendTemplates] = useState<Partial<Record<Language, string>>>({})
  const [runnerStatus, setRunnerStatus] = useState<string | null>(null)
  const [runnerError, setRunnerError] = useState<string | null>(null)
  const [runnerMessage, setRunnerMessage] = useState<string | null>(null)

  const resizeRef = useRef<HTMLDivElement>(null)
  const resultsResizeRef = useRef<HTMLDivElement>(null)
  
  const [problem, setProblem] = useState<Problem | null>(null)

  // Fetch problem details by ID from backend
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = user?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined)
        const res = await fetch(`http://localhost:4545/api/student/problems/${params.slug}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`Failed to load problem (${res.status})`)
        const data = await res.json()

        // Map difficulty to UI format
        const diffMap: Record<string, Problem['difficulty']> = { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' }
        const difficulty: Problem['difficulty'] = diffMap[data?.difficulty] || 'Easy'

        // Map examples and test cases
        const examples = Array.isArray(data?.examples) ? data.examples.map((e: any) => ({
          input: e.input,
          output: e.output,
          explanation: e.explanation,
        })) : []

        const testCases: TestCase[] = Array.isArray(data?.testCases) ? data.testCases.map((tc: any, idx: number) => ({
          id: idx + 1,
          input: tc.input,
          expected: tc.expectedOutput,
          hidden: Boolean(tc.hidden),
        })) : []

        const mapped: Problem = {
          id: data.id,
          title: data.title,
          difficulty,
          description: data.description,
          isSolved: Boolean(data?.isSolved),
          constraints: Array.isArray(data?.constraints) ? data.constraints : [],
          topics: Array.isArray(data?.topics) ? data.topics : [],
          tags: Array.isArray(data?.tags) ? data.tags : [],
          examples,
          testCases,
          providedPhoto: Array.isArray(data?.providedPhoto)
            ? data.providedPhoto
            : (typeof data?.providedPhoto === 'string' && data.providedPhoto
                ? [data.providedPhoto]
                : []),
          submissions: Array.isArray(data?.allSubmission)
            ? data.allSubmission.map((s: any) => ({
                submissionId: s.submissionId,
                name: s.name,
                year: s.year,
                branch: s.branch,
                email: s.email,
                language: s.language,
              }))
            : [],
        }

        setProblem(mapped)
        setTestResults(testCases)

        // Initialize code from backend templates if available, but only show MySolution skeleton
        const templates = data?.codeTemplates || {}

        const sanitize = (lang: Language, tpl?: string): string | undefined => {
          if (!tpl || typeof tpl !== 'string') return undefined
          try {
            switch (lang) {
              case 'Python': {
                // Try to extract method signature inside any class
                const methodMatch = tpl.match(/def\s+([\w_]+)\s*\(([^)]*)\)\s*:/)
                const signature = methodMatch ? `def ${methodMatch[1]}(${methodMatch[2]}):` : 'def solve(self, *args, **kwargs):'
                return `class Solution:\n    ${signature}\n        # TODO: Implement\n        return [0, 0]\n`
              }
              case 'Java': {
                const methodMatch = tpl.match(/(public|private|protected)\s+([\w\[\]]+)\s+(\w+)\s*\(([^)]*)\)\s*\{/)
                const ret = methodMatch ? methodMatch[2] : 'int[]'
                const name = methodMatch ? methodMatch[3] : 'solve'
                const params = methodMatch ? methodMatch[4] : ''
                const defaultReturn = ret.includes("[]") ? 'new int[]{0,0};' : ret === 'int' ? '0;' : ret === 'boolean' ? 'false;' : 'null;'
                return `public class Solution {\n    public ${ret} ${name}(${params}) {\n        // TODO: Implement\n        return ${defaultReturn}\n    }\n}\n`
              }
              case 'C++': {
                const methodMatch = tpl.match(/(vector<\s*int\s*>|int|bool|void)\s+(\w+)\s*\(([^)]*)\)\s*\{/)
                const ret = methodMatch ? methodMatch[1] : 'vector<int>'
                const name = methodMatch ? methodMatch[2] : 'solve'
                const params = methodMatch ? methodMatch[3] : 'const vector<int>& nums, int target'
                const defaultReturn = ret.includes('vector<int>') ? '{0,0};' : ret === 'int' ? '0;' : ret === 'bool' ? 'false;' : ';'
                return `class Solution{\npublic:\n    ${ret} ${name}(${params}){\n        // TODO: Implement\n        return ${defaultReturn}\n    }\n};\n`
              }
              case 'C': {
                // Try to find a function signature; fall back to canonical signature
                const sigMatch = tpl.match(/(\w+[\s\*]+)?(twoSum|solve)\s*\(([^)]*)\)/)
                const params = sigMatch ? sigMatch[3] : 'int* nums, int numsSize, int target, int* returnSize'
                return `#include <stdlib.h>\nint* twoSum(${params}) {\n    // TODO: Implement\n    *returnSize = 2;\n    int* ans = (int*)malloc(2 * sizeof(int));\n    ans[0] = 0; ans[1] = 0;\n    return ans;\n}\n`
              }
            }
          } catch { /* ignore */ }
          return undefined
        }

        const sanitized: Partial<Record<Language, string>> = {
          Python: sanitize('Python', templates.pythonTemplate) || undefined,
          Java: sanitize('Java', templates.javaTemplate) || undefined,
          'C++': sanitize('C++', templates.cppTemplate) || undefined,
          C: sanitize('C', templates.cTemplate || templates.ctemplate) || undefined,
        }
        setBackendTemplates(sanitized)

        const initial = sanitized[selectedLanguage as Language] || LANGUAGE_TEMPLATES[selectedLanguage].code
        setCode(initial)
        setOriginalCode(initial)
      } catch (e: any) {
        console.error(e)
        setError(e?.message || 'Failed to load problem')
      } finally {
        setLoading(false)
      }
    }
    fetchProblem()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug])

  useEffect(() => {
    const backend = backendTemplates[selectedLanguage as Language]
    if (backend) {
      setCode(backend)
      setOriginalCode(backend)
    } else {
      const template = LANGUAGE_TEMPLATES[selectedLanguage]
      setCode(template.code)
      setOriginalCode(template.code)
    }
  }, [selectedLanguage, backendTemplates])

  // Panel resizing logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  const handleResultsMouseDown = (e: React.MouseEvent) => {
    setIsResizingResults(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const containerWidth = window.innerWidth
        const newWidth = (e.clientX / containerWidth) * 100
        if (newWidth >= 25 && newWidth <= 75) {
          setLeftPanelWidth(newWidth)
        }
      }
      
      if (isResizingResults) {
        const containerHeight = window.innerHeight
        const editorContainer = document.querySelector('.editor-container')
        if (editorContainer) {
          const rect = editorContainer.getBoundingClientRect()
          const newHeight = rect.bottom - e.clientY
          if (newHeight >= 150 && newHeight <= 500) {
            setResultsHeight(newHeight)
          }
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setIsResizingResults(false)
    }

    if (isResizing || isResizingResults) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, isResizingResults])

  const runCode = async () => {
    if (!problem) return
    setIsRunning(true)
    setShowResults(true)
    setConsoleLogs(['Submitting to runner...'])
    setRunnerStatus(null)
    setRunnerError(null)
    setRunnerMessage(null)

    // language mappings
    const LANG_ID: Record<Language, number> = { Python: 71, Java: 62, 'C++': 54, C: 50 }
    const LANG_NAME: Record<Language, string> = { Python: 'python', Java: 'java', 'C++': 'cpp', C: 'c' }

    // reset results to pending for examples length if available, else testCases
    const baseCases = problem.testCases || []
    setExecutionProgress({ current: 0, total: baseCases.length })
    setTestResults(baseCases.map(tc => ({ ...tc, status: 'pending' as const })))

    try {
      const token = user?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined)
      // Preprocess source for runner expectations
      let sourceToSend = code
      if (selectedLanguage === 'Java') {
        // Ensure public class Solution exists (backend samples indicate this)
        // Replace class MySolution with public class Solution if found
        sourceToSend = sourceToSend.replace(/\bclass\s+MySolution\b/, 'public class Solution')
        sourceToSend = sourceToSend.replace(/\bclass\s+MySoluction\b/, 'public class Solution')
        // If already has a public class with another name, try to normalize
        if (!/public\s+class\s+Solution\b/.test(sourceToSend) && /public\s+class\s+\w+/.test(sourceToSend)) {
          sourceToSend = sourceToSend.replace(/public\s+class\s+\w+/, 'public class Solution')
        }
      }
      const body = {
        problemId: problem.id,
        language: LANG_NAME[selectedLanguage as Language],
        languageId: LANG_ID[selectedLanguage as Language],
        sourceCode: sourceToSend,
      }
      const res = await fetch('http://localhost:4545/api/student/submissions/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      })
      let json: any = null
      try {
        json = await res.json()
      } catch (_) {
        // ignore parse errors
      }

      if (!res.ok) {
        setConsoleLogs(prev => [...prev, `Runner returned HTTP ${res.status}`, json?.message || ''])
        throw new Error(`Runner HTTP ${res.status}`)
      }

      // Update console with raw output
      const outputLines = (json?.output || '').toString().split('\n').filter(Boolean)
      setConsoleLogs(prev => [...prev, ...outputLines])

      // Mark progress finished
      setExecutionProgress({ current: baseCases.length, total: baseCases.length })

      // Capture status and messages
      setRunnerStatus(json?.status || null)
      setRunnerMessage(null)
      setRunnerError(null)
      if (json?.status && ['SUCCESS','ACCEPTED'].includes(json.status)) {
        if (json?.message) setRunnerMessage(json.message)
      } else if (json?.error || json?.message) {
        setRunnerError(`${json?.error || ''}${json?.message ? (json?.error ? '\n' : '') + json.message : ''}`)
      }

      // If success, mark all example test cases as passed. Rely on status/allExamplesPassed only.
      if (json?.status === 'SUCCESS' || json?.allExamplesPassed === true) {
        setTestResults(prev => prev.map(tc => ({ ...tc, status: 'pass' as const, yourOutput: tc.expected, runtime: json?.executionTime ? `${json.executionTime}ms` : tc.runtime, memory: json?.memoryUsage ? `${json.memoryUsage}KB` : tc.memory })))
      } else {
        // Keep all tests pending and surface error prominently
        setTestResults(prev => prev.map(tc => ({ ...tc, status: tc.status === 'pass' ? 'pass' as const : 'pending' as const })))
        const errMsg = (json?.error || '') + (json?.message ? (json?.error ? '\n' : '') + json.message : '') || 'Execution failed'
        setConsoleLogs(prev => [...prev, 'Error:', ...errMsg.split('\n')])
      }
    } catch (e: any) {
      setConsoleLogs(prev => [...prev, 'Runner request failed', e?.message || String(e)])
    } finally {
      setIsRunning(false)
    }
  }

  const submitCode = async () => {
    if (!problem) return
    setIsSubmitting(true)
    setShowResults(true)
    setConsoleLogs(prev => [...prev, 'Submitting solution for evaluation...'])

    // language mappings
    const LANG_ID: Record<Language, number> = { Python: 71, Java: 62, 'C++': 54, C: 50 }
    const LANG_NAME: Record<Language, string> = { Python: 'python', Java: 'java', 'C++': 'cpp', C: 'c' }

    try {
      const token = user?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined)

      // Preprocess source like Run
      let sourceToSend = code
      if (selectedLanguage === 'Java') {
        sourceToSend = sourceToSend.replace(/\bclass\s+MySolution\b/, 'public class Solution')
        sourceToSend = sourceToSend.replace(/\bclass\s+MySoluction\b/, 'public class Solution')
        if (!/public\s+class\s+Solution\b/.test(sourceToSend) && /public\s+class\s+\w+/.test(sourceToSend)) {
          sourceToSend = sourceToSend.replace(/public\s+class\s+\w+/, 'public class Solution')
        }
      }

      const body = {
        problemId: problem.id,
        sourceCode: sourceToSend,
        language: LANG_NAME[selectedLanguage as Language],
        languageId: LANG_ID[selectedLanguage as Language],
      }

      const res = await fetch('http://localhost:4545/api/student/submissions/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      })

      let json: any = null
      try { json = await res.json() } catch (_) {}

      if (!res.ok) {
        setConsoleLogs(prev => [...prev, `Submit returned HTTP ${res.status}`, json?.message || ''])
        throw new Error(`Submit HTTP ${res.status}`)
      }

      // Capture status and messages (submit)
      setRunnerStatus(json?.status || null)
      setRunnerMessage(null)
      setRunnerError(null)
      if (json?.status && ['SUCCESS','ACCEPTED'].includes(json.status)) {
        if (json?.message) setRunnerMessage(json.message)
      } else {
        const errCombined = (json?.error || '') + (json?.message ? (json?.error ? '\n' : '') + json.message : '')
        if (errCombined) setRunnerError(errCombined)
      }

      // Console output
      const outputLines = (json?.output || '').toString().split('\n').filter(Boolean)
      if (outputLines.length) setConsoleLogs(prev => [...prev, ...outputLines])

      // Update test results using counts
      const totalFromApi = typeof json?.totalTestCases === 'number' ? json.totalTestCases : (problem.testCases?.length || 0)
      const passedFromApi = Math.max(0, Math.min(json?.testCasesPassed ?? 0, totalFromApi))

      if (totalFromApi > 0) {
        setTestResults((problem.testCases || []).slice(0, totalFromApi).map((tc, idx) => (
          idx < passedFromApi
            ? { ...tc, status: 'pass' as const, yourOutput: tc.expected, runtime: json?.executionTime ? `${json.executionTime * 1000 < 1 ? json.executionTime : json.executionTime}ms` : tc.runtime, memory: json?.memoryUsage ? `${json.memoryUsage}KB` : tc.memory }
            : { ...tc, status: 'fail' as const, yourOutput: tc.yourOutput || '—' }
        )))
        setExecutionProgress({ current: totalFromApi, total: totalFromApi })
      }
    } catch (e: any) {
      setConsoleLogs(prev => [...prev, 'Submit request failed', e?.message || String(e)])
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetCode = () => {
    setCode(originalCode)
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      // You can add a toast notification here
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500 bg-green-50 border-green-200'
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Hard': return 'text-red-500 bg-red-50 border-red-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const tabs = [
    { id: 'description', label: 'Description', icon: Code },
    { id: 'examples', label: 'Examples', icon: Lightbulb },
    { id: 'submissions', label: 'Submissions', icon: History }
  ]

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-foreground">
              {problem?.title || 'Loading...'}
            </h1>
            {problem && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            )}
            {problem && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${problem.isSolved ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                {problem.isSolved ? 'Solved' : 'Unsolved'}
              </span>
            )}
          </div>
          {/* Optional metadata area - hidden if not available */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div 
          className="bg-card border-r flex flex-col shadow-sm"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            problem={problem || { title: '', difficulty: 'Easy', description: '', examples: [], testCases: [] }}
          />
        </div>

        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />

        {/* Right Panel */}
        <div className="flex-1 flex flex-col bg-background editor-container relative">
          <EditorHeader
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            editorTheme={editorTheme}
            onThemeChange={setEditorTheme}
            fileName={LANGUAGE_TEMPLATES[selectedLanguage].fileName}
            onCopy={copyCode}
            onReset={resetCode}
            onRun={runCode}
            onSubmit={submitCode}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
          />

          {/* Monaco Editor */}
          <div className="flex-1 relative overflow-hidden">
            <React.Suspense fallback={
              <div className="flex items-center justify-center h-full bg-muted/50">
                <div className="text-muted-foreground">Loading editor...</div>
              </div>
            }>
              <MonacoEditor
                height="100%"
                language={selectedLanguage.toLowerCase() === 'c++' ? 'cpp' : selectedLanguage.toLowerCase()}
                theme={editorTheme}
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  padding: { top: 16, bottom: 16 }
                }}
              />
            </React.Suspense>
          </div>

          {/* Results Drawer */}
          <ResultsDrawer
            isVisible={showResults}
            onClose={() => setShowResults(false)}
            testResults={testResults}
            consoleLogs={consoleLogs}
            executionProgress={executionProgress}
            isRunning={isRunning}
            height={resultsHeight}
            onResizeStart={handleResultsMouseDown}
            isResizing={isResizingResults}
            status={runnerStatus}
            errorText={runnerError}
            successText={runnerMessage}
          />
        </div>
      </div>

      {/* Submission Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-card rounded-xl p-8 shadow-2xl max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  🚀 Submitting Solution...
                </h3>
                <p className="text-muted-foreground">
                  Running comprehensive tests on your code
                </p>
                <div className="mt-4 bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.8, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
