const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireStudent } = require('../middleware/auth');
const CodeExecution = require('../services/codeExecution');

const router = express.Router();

// Apply student role requirement to all routes
router.use(requireStudent);

// Get student dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const userId = req.user.id;

    // Get user's solved problems count
    const { data: solvedProblems } = await supabase
      .from('user_problem_progress')
      .select('problem_id')
      .eq('user_id', userId)
      .eq('is_solved', true);

    const totalProblemsSolved = solvedProblems?.length || 0;

    // Get user's badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select(`
        badge_id,
        earned_at,
        badges (
          id,
          name,
          description,
          icon_url
        )
      `)
      .eq('user_id', userId);

    // Calculate rank (simplified - based on total solved)
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, total_solved')
      .eq('role', 'student')
      .eq('status', 'approved')
      .order('total_solved', { ascending: false });

    const userRank = allUsers?.findIndex(user => user.id === userId) + 1;
    const totalUsers = allUsers?.length || 1;
    const percentile = Math.round(((totalUsers - userRank + 1) / totalUsers) * 100);

    // Get current week's goal
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const { data: weeklyGoal } = await supabase
      .from('weekly_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart.toISOString().split('T')[0])
      .single();

    // Get user profile data
    const { data: userProfile } = await supabase
      .from('users')
      .select('email, branch, full_name')
      .eq('id', userId)
      .single();

    res.json({
      totalProblemsSolved,
      rank: {
        globalRank: userRank,
        totalUsers,
        percentile
      },
      badges: userBadges?.map(ub => ({
        id: ub.badges.id,
        name: ub.badges.name,
        description: ub.badges.description,
        iconUrl: ub.badges.icon_url,
        earnedAt: ub.earned_at
      })) || [],
      weeklyGoal: weeklyGoal ? {
        weekStart: weeklyGoal.week_start,
        weekEnd: weeklyGoal.week_end,
        target: weeklyGoal.target_problems,
        completed: weeklyGoal.completed_problems,
        percentage: Math.round((weeklyGoal.completed_problems / weeklyGoal.target_problems) * 100)
      } : {
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        target: 5,
        completed: 0,
        percentage: 0
      },
      user: userProfile
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: 'An error occurred while loading your dashboard'
    });
  }
});

// Get problems list
router.get('/problems', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const userId = req.user.id;

    // Get all problems with user's progress
    const { data: problems, error } = await supabase
      .from('problems')
      .select(`
        id,
        title,
        difficulty,
        solve_percentage,
        topics,
        tags,
        user_problem_progress!left (
          is_solved,
          attempts
        )
      `)
      .eq('user_problem_progress.user_id', userId);

    if (error) {
      console.error('Problems fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch problems',
        message: 'An error occurred while loading problems'
      });
    }

    // Format the response
    const formattedProblems = problems?.map((problem, index) => ({
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      solvePercentage: problem.solve_percentage,
      topics: problem.topics || [],
      tags: problem.tags || [],
      number: index + 1,
      isSolved: problem.user_problem_progress?.[0]?.is_solved || false,
      attempts: problem.user_problem_progress?.[0]?.attempts || 0
    })) || [];

    res.json(formattedProblems);

  } catch (error) {
    console.error('Problems error:', error);
    res.status(500).json({
      error: 'Failed to fetch problems',
      message: 'An error occurred while loading problems'
    });
  }
});

// Get specific problem details
router.get('/problems/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const supabase = req.app.locals.supabase;
    const userId = req.user.id;

    // Get problem details
    const { data: problem, error } = await supabase
      .from('problems')
      .select(`
        *,
        user_problem_progress!left (
          is_solved,
          attempts,
          solved_at
        )
      `)
      .eq('id', problemId)
      .eq('user_problem_progress.user_id', userId)
      .single();

    if (error || !problem) {
      return res.status(404).json({
        error: 'Problem not found',
        message: 'The requested problem does not exist'
      });
    }

    // Get user's submissions for this problem
    const { data: submissions } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .order('submitted_at', { ascending: false })
      .limit(10);

    // Format the response
    const formattedProblem = {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      constraints: problem.constraints || [],
      topics: problem.topics || [],
      tags: problem.tags || [],
      examples: problem.examples || [],
      testCases: problem.test_cases || [],
      codeTemplates: problem.code_templates || {},
      timeLimit: problem.time_limit,
      memoryLimit: problem.memory_limit,
      solvePercentage: problem.solve_percentage,
      isSolved: problem.user_problem_progress?.[0]?.is_solved || false,
      attempts: problem.user_problem_progress?.[0]?.attempts || 0,
      solvedAt: problem.user_problem_progress?.[0]?.solved_at,
      allSubmission: submissions?.map(sub => ({
        submissionId: sub.id,
        name: req.user.full_name,
        year: req.user.year,
        branch: req.user.branch,
        email: req.user.email,
        language: sub.language,
        status: sub.status,
        submittedAt: sub.submitted_at
      })) || []
    };

    res.json(formattedProblem);

  } catch (error) {
    console.error('Problem details error:', error);
    res.status(500).json({
      error: 'Failed to fetch problem details',
      message: 'An error occurred while loading the problem'
    });
  }
});

// Run code (test against examples)
router.post('/submissions/run', async (req, res) => {
  try {
    const { problemId, sourceCode, language, languageId } = req.body;
    const supabase = req.app.locals.supabase;
    const userId = req.user.id;

    // Validate input
    if (!problemId || !sourceCode || !language) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Problem ID, source code, and language are required'
      });
    }

    // Get problem details
    const { data: problem, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', problemId)
      .single();

    if (error || !problem) {
      return res.status(404).json({
        error: 'Problem not found',
        message: 'The requested problem does not exist'
      });
    }

    // Execute code using the code execution service
    const executionResult = await CodeExecution.executeCode(sourceCode, language, problem.test_cases || []);

    res.json({
      status: executionResult.status,
      output: executionResult.output,
      executionTime: executionResult.executionTime,
      memoryUsage: executionResult.memoryUsage,
      allExamplesPassed: executionResult.allExamplesPassed,
      message: executionResult.message
    });

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      error: 'Code execution failed',
      message: 'An error occurred while executing your code'
    });
  }
});

// Submit code for evaluation
router.post('/submissions/execute', async (req, res) => {
  try {
    const { problemId, sourceCode, language, languageId } = req.body;
    const supabase = req.app.locals.supabase;
    const userId = req.user.id;

    // Validate input
    if (!problemId || !sourceCode || !language) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Problem ID, source code, and language are required'
      });
    }

    // Get problem details
    const { data: problem, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', problemId)
      .single();

    if (error || !problem) {
      return res.status(404).json({
        error: 'Problem not found',
        message: 'The requested problem does not exist'
      });
    }

    // Execute code against all test cases
    const executionResult = await CodeExecution.executeCode(sourceCode, language, problem.test_cases || [], true);

    // Create submission record
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        problem_id: problemId,
        source_code: sourceCode,
        language,
        language_id: languageId || 0,
        status: executionResult.status,
        test_cases_passed: executionResult.testCasesPassed,
        total_test_cases: executionResult.totalTestCases,
        execution_time: executionResult.executionTime,
        memory_usage: executionResult.memoryUsage,
        output: executionResult.output,
        error_message: executionResult.errorMessage
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Submission creation error:', submissionError);
    }

    // Update user progress if problem was solved
    if (executionResult.status === 'accepted') {
      await updateUserProgress(userId, problemId, supabase);
    }

    res.json({
      status: executionResult.status,
      testCasesPassed: executionResult.testCasesPassed,
      totalTestCases: executionResult.totalTestCases,
      executionTime: executionResult.executionTime,
      memoryUsage: executionResult.memoryUsage,
      output: executionResult.output,
      message: executionResult.message,
      submissionId: submission?.id
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      error: 'Submission failed',
      message: 'An error occurred while submitting your code'
    });
  }
});

// Get user's submissions
router.get('/submissions', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const userId = req.user.id;
    const { problemId, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('submissions')
      .select(`
        *,
        problems (
          id,
          title,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (problemId) {
      query = query.eq('problem_id', problemId);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Submissions fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch submissions',
        message: 'An error occurred while loading submissions'
      });
    }

    res.json(submissions || []);

  } catch (error) {
    console.error('Submissions error:', error);
    res.status(500).json({
      error: 'Failed to fetch submissions',
      message: 'An error occurred while loading submissions'
    });
  }
});

// Get user's badges
router.get('/badges', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const userId = req.user.id;

    const { data: userBadges, error } = await supabase
      .from('user_badges')
      .select(`
        earned_at,
        badges (
          id,
          name,
          description,
          icon_url
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Badges fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch badges',
        message: 'An error occurred while loading badges'
      });
    }

    const formattedBadges = userBadges?.map(ub => ({
      id: ub.badges.id,
      name: ub.badges.name,
      description: ub.badges.description,
      iconUrl: ub.badges.icon_url,
      earnedAt: ub.earned_at
    })) || [];

    res.json(formattedBadges);

  } catch (error) {
    console.error('Badges error:', error);
    res.status(500).json({
      error: 'Failed to fetch badges',
      message: 'An error occurred while loading badges'
    });
  }
});

// This function is now handled by the CodeExecution service

// Helper function to update user progress
async function updateUserProgress(userId, problemId, supabase) {
  try {
    // Check if user already solved this problem
    const { data: existingProgress } = await supabase
      .from('user_problem_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .single();

    if (existingProgress && existingProgress.is_solved) {
      return; // Already solved
    }

    if (existingProgress) {
      // Update existing progress
      await supabase
        .from('user_problem_progress')
        .update({
          is_solved: true,
          solved_at: new Date().toISOString(),
          attempts: existingProgress.attempts + 1
        })
        .eq('user_id', userId)
        .eq('problem_id', problemId);
    } else {
      // Create new progress record
      await supabase
        .from('user_problem_progress')
        .insert({
          user_id: userId,
          problem_id: problemId,
          is_solved: true,
          solved_at: new Date().toISOString(),
          attempts: 1
        });
    }

    // Update user's total solved count
    const { data: solvedCount } = await supabase
      .from('user_problem_progress')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_solved', true);

    await supabase
      .from('users')
      .update({ total_solved: solvedCount?.length || 0 })
      .eq('id', userId);

  } catch (error) {
    console.error('Update progress error:', error);
  }
}

module.exports = router;
