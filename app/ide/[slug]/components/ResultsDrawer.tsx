'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Clock, ChevronUp, ChevronDown, Terminal, Activity, GripHorizontal } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

interface TestCase {
  id: number
  input: string
  expected: string
  yourOutput?: string
  status?: 'pass' | 'fail' | 'pending' | 'running'
  runtime?: string
  memory?: string
}

interface ResultsDrawerProps {
  isVisible: boolean
  onClose: () => void
  testResults: TestCase[]
  consoleLogs: string[]
  executionProgress: { current: number; total: number }
  isRunning: boolean
  height: number
  onResizeStart: (e: React.MouseEvent) => void
  isResizing: boolean
  status?: string | null
  errorText?: string | null
  successText?: string | null
}

export function ResultsDrawer({
  isVisible,
  onClose,
  testResults,
  consoleLogs,
  executionProgress,
  isRunning,
  height,
  onResizeStart,
  isResizing,
  status,
  errorText,
  successText
}: ResultsDrawerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeResultsTab, setActiveResultsTab] = useState('testcases')

  const passedTests = testResults.filter(test => test.status === 'pass').length
  const totalTests = testResults.length
  const firstFailedIndex = testResults.findIndex(test => test.status === 'fail')

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
      case 'fail':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
      case 'running':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
      default:
        return 'bg-muted border-muted'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ 
            y: isCollapsed ? `calc(100% - 48px)` : 0, 
            opacity: 1 
          }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute bottom-0 left-0 right-0 bg-card border-t shadow-lg z-20"
          style={{ height: isCollapsed ? 48 : height }}
        >
          {/* Resize Handle */}
          <div
            className={`absolute -top-1 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/20 flex items-center justify-center ${
              isResizing ? 'bg-primary/20' : ''
            }`}
            onMouseDown={onResizeStart}
          >
            <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold text-foreground">Results</h3>
              
              {isRunning && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {executionProgress.current}/{executionProgress.total} executed
                  </span>
                </div>
              )}
              
              {!isRunning && totalTests > 0 && (
                <Badge variant={passedTests === totalTests ? 'default' : 'destructive'}>
                  {passedTests}/{totalTests} passed
                </Badge>
              )}

              {!isRunning && status && (
                <Badge variant={(status === 'SUCCESS' || status === 'ACCEPTED') ? 'default' : 'destructive'} className="uppercase">
                  {status}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="px-4 py-2 border-b">
              <Progress 
                value={(executionProgress.current / executionProgress.total) * 100} 
                className="w-full h-2"
              />
            </div>
          )}

          {/* Content */}
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              {/* Success banner */}
              {successText && status && ['SUCCESS','ACCEPTED'].includes(status) && (
                <div className="px-4 pt-3">
                  <Card className="p-3 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                    <div className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">Success</div>
                    <code className="block whitespace-pre-wrap break-words text-xs text-foreground">
                      {successText}
                    </code>
                  </Card>
                </div>
              )}

              {/* Error banner */}
              {errorText && status && !['SUCCESS','ACCEPTED'].includes(status) && (
                <div className="px-4 pt-3">
                  <Card className="p-3 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                    <div className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">Error</div>
                    <code className="block whitespace-pre-wrap break-words text-xs text-foreground">
                      {errorText}
                    </code>
                  </Card>
                </div>
              )}
              <Tabs value={activeResultsTab} onValueChange={setActiveResultsTab} className="h-full min-h-0 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
                  <TabsTrigger value="testcases" className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Test Cases</span>
                  </TabsTrigger>
                  <TabsTrigger value="console" className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4" />
                    <span>Console</span>
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Stats</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="testcases" className="flex-1 overflow-y-auto p-4 pt-2">
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg border transition-all ${getStatusColor(result.status)} ${
                          firstFailedIndex === index ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(result.status)}
                            <span className="font-medium text-sm">
                              Test Case {index + 1}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {result.status?.toUpperCase() || 'PENDING'}
                            </Badge>
                          </div>
                          
                          {result.runtime && result.memory && (
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>{result.runtime}</span>
                              <span>{result.memory}</span>
                            </div>
                          )}
                        </div>
                        
                        {result.status === 'fail' && (
                          <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground">Expected:</span>
                              <code className="block bg-background px-2 py-1 rounded mt-1 font-mono">
                                {result.expected}
                              </code>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Got:</span>
                              <code className="block bg-background px-2 py-1 rounded mt-1 font-mono">
                                {result.yourOutput}
                              </code>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="console" className="flex-1 min-h-0 overflow-y-auto p-4 pt-2">
                  <Card className="h-full p-4 overflow-auto">
                    <div className="font-mono text-sm space-y-1 text-foreground whitespace-pre-wrap break-words">
                      {consoleLogs.map((log, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="py-1"
                        >
                          {log}
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="stats" className="flex-1 overflow-y-auto p-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-foreground">
                        {passedTests}/{totalTests}
                      </div>
                      <div className="text-sm text-muted-foreground">Tests Passed</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-foreground">
                        {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-foreground">
                        {testResults.find(t => t.runtime)?.runtime || '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Runtime</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-foreground">
                        {testResults.find(t => t.memory)?.memory || '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">Memory Usage</div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
