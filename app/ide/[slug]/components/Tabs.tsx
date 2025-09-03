'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LucideIcon, History } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface Tab {
  id: string
  label: string
  icon: LucideIcon
}

interface Problem {
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  acceptanceRate?: number
  timeComplexity?: string
  description: string
  constraints?: string[]
  topics?: string[]
  tags?: string[]
  examples: Array<{
    input: string
    output: string
    explanation: string
  }>
  testCases: Array<{
    id: number
    input: string
    expected: string
    hidden?: boolean
  }>
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

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  problem: Problem
}

export function Tabs({ tabs, activeTab, onTabChange, problem }: TabsProps) {
  // Code Viewer Modal state
  const [isCodeOpen, setIsCodeOpen] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codePayload, setCodePayload] = useState<null | {
    submissionId: string
    problemId?: string
    language?: string
    submittedAt?: string
    sourceCode: string
  }>(null)

  const openCode = async (submissionId: string) => {
    try {
      setIsCodeOpen(true)
      setCodeLoading(true)
      setCodeError(null)
      setCodePayload(null)

      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : ''
      const res = await fetch(`http://localhost:4545/api/student/submissions/${submissionId}/code`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      })
      let json: any = null
      try { json = await res.json() } catch (_) {}
      if (!res.ok) {
        throw new Error(json?.message || `Failed to fetch code (${res.status})`)
      }

      setCodePayload({
        submissionId,
        problemId: json?.problemId,
        language: json?.language,
        submittedAt: json?.submittedAt,
        sourceCode: json?.sourceCode || '',
      })
    } catch (e: any) {
      setCodeError(e?.message || 'Failed to fetch submission code')
    } finally {
      setCodeLoading(false)
    }
  }

  const copyCode = async () => {
    if (!codePayload?.sourceCode) return
    try {
      await navigator.clipboard.writeText(codePayload.sourceCode)
    } catch (_) {}
  }
  return (
    <>
      {/* Tab Headers */}
      <div className="flex border-b bg-muted/30">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-all hover:bg-muted/50 ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-background'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div
                key="description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                  {/* Main Description */}
                  <div className="whitespace-pre-line text-foreground leading-relaxed">
                    {problem.description}
                  </div>

                  {/* Provided Photos */}
                  {problem.providedPhoto && problem.providedPhoto.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Provided Photos</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {problem.providedPhoto.map((src, idx) => (
                          <div key={idx} className="border rounded-md overflow-hidden bg-muted/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={`Provided ${idx + 1}`} className="w-full h-32 object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Difficulty */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Difficulty</h4>
                    <Badge variant="secondary">{problem.difficulty}</Badge>
                  </div>

                  {/* Constraints */}
                  {problem.constraints && problem.constraints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Constraints</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        {problem.constraints.map((c, idx) => (
                          <li key={idx} className="text-foreground">{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Topics */}
                  {problem.topics && problem.topics.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {problem.topics.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {problem.tags && problem.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {problem.tags.map((t) => (
                          <Badge key={t} className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Examples summary */}
                  {problem.examples && problem.examples.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Examples (summary)</h4>
                      <div className="space-y-3">
                        {problem.examples.map((ex, i) => (
                          <div key={i} className="border rounded-md p-3 bg-muted/30">
                            <div className="text-xs text-muted-foreground mb-1">Example {i + 1}</div>
                            <div className="text-sm"><span className="font-medium">Input:</span> {ex.input}</div>
                            <div className="text-sm"><span className="font-medium">Output:</span> {ex.output}</div>
                            <div className="text-sm text-muted-foreground mt-1">{ex.explanation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'testcases' && (
              <motion.div
                key="testcases"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {problem.testCases.map((testCase, index) => (
                  <Card key={testCase.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold mr-2">
                        #{index + 1}
                      </span>
                      Test Case {index + 1}
                      {testCase.hidden && (
                        <span className="ml-2">
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">Hidden</Badge>
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-muted-foreground font-medium">Input:</span>
                        <code className="bg-muted px-3 py-2 rounded-md font-mono text-foreground whitespace-pre-wrap break-words">
                          {testCase.input}
                        </code>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-muted-foreground font-medium">Expected:</span>
                        <code className="bg-muted px-3 py-2 rounded-md font-mono text-foreground whitespace-pre-wrap break-words">
                          {testCase.expected}
                        </code>
                      </div>
                    </div>
                  </Card>
                ))}
              </motion.div>
            )}

            {activeTab === 'examples' && (
              <motion.div
                key="examples"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {problem.examples.map((example, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="font-medium text-foreground mb-3 flex items-center">
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded text-xs font-bold mr-2">
                        Ex {index + 1}
                      </span>
                      Example {index + 1}
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-muted-foreground font-medium">Input:</span>
                        <code className="bg-muted px-3 py-2 rounded-md font-mono text-foreground whitespace-pre-wrap break-words">
                          {example.input}
                        </code>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-muted-foreground font-medium">Output:</span>
                        <code className="bg-muted px-3 py-2 rounded-md font-mono text-foreground whitespace-pre-wrap break-words">
                          {example.output}
                        </code>
                      </div>
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground font-medium">Explanation:</span>
                        <p className="text-foreground mt-1 leading-relaxed">
                          {example.explanation}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </motion.div>
            )}

            {activeTab === 'submissions' && (
              <motion.div
                key="submissions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {problem.submissions && problem.submissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b">
                          <th className="py-2 pr-3">Name</th>
                          <th className="py-2 pr-3">Year</th>
                          <th className="py-2 pr-3">Branch</th>
                          <th className="py-2 pr-3">Language</th>
                          <th className="py-2 pr-3">Email</th>
                          <th className="py-2 pr-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {problem.submissions.map((s) => (
                          <tr key={s.submissionId} className="border-b hover:bg-muted/30">
                            <td className="py-2 pr-3 text-foreground">{s.name}</td>
                            <td className="py-2 pr-3 text-foreground">{s.year || '—'}</td>
                            <td className="py-2 pr-3 text-foreground">{s.branch || '—'}</td>
                            <td className="py-2 pr-3 text-foreground capitalize">{s.language || '—'}</td>
                            <td className="py-2 pr-3 text-foreground">{s.email || '—'}</td>
                            <td className="py-2 pr-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCode(s.submissionId)}
                              >
                                View Code
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <History className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No submissions yet</h3>
                    <p className="text-muted-foreground">
                      Your submission history will appear here after you submit your first solution
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Code Viewer Modal */}
      <Dialog open={isCodeOpen} onOpenChange={setIsCodeOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Submission Code</DialogTitle>
            <DialogDescription>
              {codePayload?.language && (
                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  Language: <span className="uppercase font-medium">{codePayload.language}</span>
                </span>
              )}
              {codePayload?.submittedAt && (
                <span className="ml-3 text-xs text-muted-foreground">Submitted: {new Date(codePayload.submittedAt).toLocaleString()}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-muted-foreground truncate">
              {codePayload?.submissionId && (
                <span>Submission: {codePayload.submissionId}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={copyCode} disabled={!codePayload?.sourceCode}>
                Copy
              </Button>
            </div>
          </div>

          <div className="border rounded-md bg-muted/30 overflow-hidden">
            <pre className="max-h-[60vh] overflow-auto p-4 text-xs leading-relaxed">
<code className="whitespace-pre">{codeLoading ? 'Loading code...' : (codeError ? codeError : (codePayload?.sourceCode || 'No code available'))}</code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
