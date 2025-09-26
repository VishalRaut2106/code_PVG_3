const axios = require('axios');

class CodeExecutionService {
  constructor() {
    this.baseURL = process.env.CODE_EXECUTION_URL || 'http://localhost:8080';
    this.apiKey = process.env.CODE_EXECUTION_API_KEY;
  }

  async executeCode(sourceCode, language, testCases, isFullSubmission = false) {
    try {
      // Language mapping
      const languageMap = {
        'python': 71,
        'java': 62,
        'cpp': 54,
        'c': 50,
        'javascript': 63,
        'typescript': 74
      };

      const languageId = languageMap[language.toLowerCase()] || 71;

      // Prepare execution data
      const executionData = {
        source_code: sourceCode,
        language_id: languageId,
        test_cases: testCases,
        is_full_submission: isFullSubmission
      };

      // Make request to code execution service
      const response = await axios.post(`${this.baseURL}/execute`, executionData, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        timeout: 30000 // 30 seconds timeout
      });

      return this.formatResponse(response.data);

    } catch (error) {
      console.error('Code execution error:', error);
      
      if (error.code === 'ECONNREFUSED') {
        return this.getFallbackResponse(testCases, 'Code execution service unavailable');
      }
      
      if (error.response) {
        return this.formatErrorResponse(error.response.data);
      }
      
      return this.getFallbackResponse(testCases, 'Code execution failed');
    }
  }

  formatResponse(data) {
    return {
      status: data.status || 'unknown',
      output: data.output || '',
      executionTime: data.execution_time || 0,
      memoryUsage: data.memory_usage || 0,
      testCasesPassed: data.test_cases_passed || 0,
      totalTestCases: data.total_test_cases || 0,
      allExamplesPassed: data.all_examples_passed || false,
      message: data.message || '',
      errorMessage: data.error_message || null
    };
  }

  formatErrorResponse(errorData) {
    return {
      status: 'runtime_error',
      output: '',
      executionTime: 0,
      memoryUsage: 0,
      testCasesPassed: 0,
      totalTestCases: 0,
      allExamplesPassed: false,
      message: 'Code execution failed',
      errorMessage: errorData.message || 'Unknown error occurred'
    };
  }

  getFallbackResponse(testCases, errorMessage) {
    // Return a mock response when code execution service is unavailable
    return {
      status: 'runtime_error',
      output: '',
      executionTime: 0,
      memoryUsage: 0,
      testCasesPassed: 0,
      totalTestCases: testCases.length,
      allExamplesPassed: false,
      message: 'Code execution service is currently unavailable',
      errorMessage: errorMessage
    };
  }

  // Health check for code execution service
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.error('Code execution service health check failed:', error);
      return false;
    }
  }
}

// Mock code execution service for development/testing
class MockCodeExecutionService extends CodeExecutionService {
  async executeCode(sourceCode, language, testCases, isFullSubmission = false) {
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Mock different outcomes based on source code content
    const hasReturn = sourceCode.includes('return');
    const hasMain = sourceCode.includes('main') || sourceCode.includes('def ') || sourceCode.includes('class ');
    
    let status = 'wrong_answer';
    let testCasesPassed = 0;
    
    if (hasReturn && hasMain) {
      // Simulate successful execution
      status = 'accepted';
      testCasesPassed = testCases.length;
    } else if (hasReturn) {
      // Partial success
      testCasesPassed = Math.floor(testCases.length * 0.7);
      status = testCasesPassed === testCases.length ? 'accepted' : 'wrong_answer';
    } else if (sourceCode.includes('error') || sourceCode.includes('Error')) {
      status = 'runtime_error';
    } else if (sourceCode.includes('timeout')) {
      status = 'time_limit_exceeded';
    }

    return {
      status,
      output: status === 'accepted' ? 'All test cases passed!' : 'Some test cases failed',
      executionTime: Math.random() * 1000 + 100,
      memoryUsage: Math.random() * 50 + 10,
      testCasesPassed,
      totalTestCases: testCases.length,
      allExamplesPassed: testCasesPassed === testCases.length,
      message: status === 'accepted' ? 'Solution accepted!' : 'Solution needs improvement',
      errorMessage: status === 'runtime_error' ? 'Runtime error occurred' : null
    };
  }
}

// Export the appropriate service based on environment
const CodeExecution = process.env.NODE_ENV === 'development' && !process.env.CODE_EXECUTION_URL 
  ? new MockCodeExecutionService() 
  : new CodeExecutionService();

module.exports = CodeExecution;
