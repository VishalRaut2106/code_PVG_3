'use client'

import React from 'react'
import { Moon, Sun, Copy, RotateCcw, Play, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EditorHeaderProps {
  selectedLanguage: string
  onLanguageChange: (language: any) => void
  editorTheme: string
  onThemeChange: (theme: string) => void
  fileName: string
  onCopy: () => void
  onReset: () => void
  onRun: () => void
  onSubmit: () => void
  isRunning: boolean
  isSubmitting: boolean
}

const LANGUAGES = ['Python', 'Java', 'C++', 'C']

export function EditorHeader({
  selectedLanguage,
  onLanguageChange,
  editorTheme,
  onThemeChange,
  fileName,
  onCopy,
  onReset,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting
}: EditorHeaderProps) {
  return (
    <div className="bg-card border-b px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground text-sm">File:</span>
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
              {fileName}
            </code>
          </div>
          
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Utility Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            className="hover:bg-muted"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="hover:bg-muted"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onThemeChange(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
            className="hover:bg-muted"
          >
            {editorTheme === 'vs-dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Action Buttons */}
          <Button
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-1" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          
          <Button
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4 mr-1" />
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
