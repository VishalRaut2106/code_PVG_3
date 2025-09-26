const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

const router = express.Router();

// Apply admin role requirement to all routes
router.use(requireAdmin);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || 
        file.mimetype === 'text/csv' || 
        file.originalname.endsWith('.json') || 
        file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and CSV files are allowed'), false);
    }
  }
});

// Get pending users for approval
router.get('/users/pending', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    const { data: pendingUsers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Pending users fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch pending users',
        message: 'An error occurred while loading pending users'
      });
    }

    res.json(pendingUsers || []);

  } catch (error) {
    console.error('Pending users error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending users',
      message: 'An error occurred while loading pending users'
    });
  }
});

// Approve user
router.post('/users/:userId/approve', async (req, res) => {
  try {
    const { userId } = req.params;
    const supabase = req.app.locals.supabase;

    // Update user status to approved
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('role', 'student')
      .select()
      .single();

    if (error || !updatedUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist or is not a student'
      });
    }

    res.json({
      message: 'User approved successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        status: updatedUser.status
      }
    });

  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      error: 'Failed to approve user',
      message: 'An error occurred while approving the user'
    });
  }
});

// Reject user
router.post('/users/:userId/reject', async (req, res) => {
  try {
    const { userId } = req.params;
    const supabase = req.app.locals.supabase;

    // Update user status to rejected
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('role', 'student')
      .select()
      .single();

    if (error || !updatedUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist or is not a student'
      });
    }

    res.json({
      message: 'User rejected successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        status: updatedUser.status
      }
    });

  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      error: 'Failed to reject user',
      message: 'An error occurred while rejecting the user'
    });
  }
});

// Get all users with filtering
router.get('/users', async (req, res) => {
  try {
    const { status, role, branch, year, page = 1, limit = 50 } = req.query;
    const supabase = req.app.locals.supabase;

    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq('status', status);
    if (role) query = query.eq('role', role);
    if (branch) query = query.eq('branch', branch);
    if (year) query = query.eq('year', year);

    const { data: users, error } = await query;

    if (error) {
      console.error('Users fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch users',
        message: 'An error occurred while loading users'
      });
    }

    res.json(users || []);

  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'An error occurred while loading users'
    });
  }
});

// Get problems list for admin
router.get('/problems', async (req, res) => {
  try {
    const { difficulty, topic, assigned, page = 1, limit = 50 } = req.query;
    const supabase = req.app.locals.supabase;

    let query = supabase
      .from('problems')
      .select(`
        *,
        user_problem_progress (
          user_id,
          is_solved
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (difficulty) query = query.eq('difficulty', difficulty);
    if (topic) query = query.contains('topics', [topic]);

    const { data: problems, error } = await query;

    if (error) {
      console.error('Problems fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch problems',
        message: 'An error occurred while loading problems'
      });
    }

    // Calculate solve statistics
    const problemsWithStats = problems?.map(problem => {
      const solvedCount = problem.user_problem_progress?.filter(up => up.is_solved).length || 0;
      const totalAttempts = problem.user_problem_progress?.length || 0;
      
      return {
        ...problem,
        solveCount: solvedCount,
        attemptCount: totalAttempts,
        solvePercentage: totalAttempts > 0 ? Math.round((solvedCount / totalAttempts) * 100) : 0
      };
    }) || [];

    res.json(problemsWithStats);

  } catch (error) {
    console.error('Problems error:', error);
    res.status(500).json({
      error: 'Failed to fetch problems',
      message: 'An error occurred while loading problems'
    });
  }
});

// Create new problem
router.post('/problems', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty level'),
  body('testCases').isArray().withMessage('Test cases must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      title,
      description,
      difficulty,
      constraints,
      topics,
      tags,
      examples,
      testCases,
      codeTemplates,
      timeLimit,
      memoryLimit,
      assignedToYears,
      assignedToDepartments
    } = req.body;

    const supabase = req.app.locals.supabase;

    const { data: newProblem, error } = await supabase
      .from('problems')
      .insert({
        title,
        description,
        difficulty,
        constraints: constraints || [],
        topics: topics || [],
        tags: tags || [],
        examples: examples || [],
        test_cases: testCases || [],
        code_templates: codeTemplates || {},
        time_limit: timeLimit || 1000,
        memory_limit: memoryLimit || 128,
        assigned_to_years: assignedToYears || [],
        assigned_to_departments: assignedToDepartments || []
      })
      .select()
      .single();

    if (error) {
      console.error('Problem creation error:', error);
      return res.status(500).json({
        error: 'Failed to create problem',
        message: 'An error occurred while creating the problem'
      });
    }

    res.status(201).json({
      message: 'Problem created successfully',
      problem: newProblem
    });

  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({
      error: 'Failed to create problem',
      message: 'An error occurred while creating the problem'
    });
  }
});

// Update problem
router.put('/problems/:problemId', [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { problemId } = req.params;
    const updateData = req.body;
    const supabase = req.app.locals.supabase;

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: updatedProblem, error } = await supabase
      .from('problems')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', problemId)
      .select()
      .single();

    if (error || !updatedProblem) {
      return res.status(404).json({
        error: 'Problem not found',
        message: 'The specified problem does not exist'
      });
    }

    res.json({
      message: 'Problem updated successfully',
      problem: updatedProblem
    });

  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({
      error: 'Failed to update problem',
      message: 'An error occurred while updating the problem'
    });
  }
});

// Delete problem
router.delete('/problems/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const supabase = req.app.locals.supabase;

    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('id', problemId);

    if (error) {
      console.error('Problem deletion error:', error);
      return res.status(500).json({
        error: 'Failed to delete problem',
        message: 'An error occurred while deleting the problem'
      });
    }

    res.json({
      message: 'Problem deleted successfully'
    });

  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({
      error: 'Failed to delete problem',
      message: 'An error occurred while deleting the problem'
    });
  }
});

// Upload problems from file
router.post('/problems/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please upload a JSON or CSV file'
      });
    }

    const supabase = req.app.locals.supabase;
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    let problems = [];

    if (fileName.endsWith('.json')) {
      // Parse JSON file
      try {
        const jsonData = JSON.parse(fileBuffer.toString());
        problems = Array.isArray(jsonData) ? jsonData : [jsonData];
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid JSON file',
          message: 'The uploaded file is not a valid JSON format'
        });
      }
    } else if (fileName.endsWith('.csv')) {
      // Parse CSV file
      problems = await parseCSV(fileBuffer);
    }

    if (problems.length === 0) {
      return res.status(400).json({
        error: 'No problems found',
        message: 'The uploaded file does not contain any valid problems'
      });
    }

    // Validate and format problems
    const validatedProblems = problems.map((problem, index) => ({
      title: problem.title || `Problem ${index + 1}`,
      description: problem.description || '',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(problem.difficulty) ? problem.difficulty : 'Medium',
      constraints: Array.isArray(problem.constraints) ? problem.constraints : [],
      topics: Array.isArray(problem.topics) ? problem.topics : [],
      tags: Array.isArray(problem.tags) ? problem.tags : [],
      examples: Array.isArray(problem.examples) ? problem.examples : [],
      test_cases: Array.isArray(problem.testCases) ? problem.testCases : [],
      code_templates: problem.codeTemplates || {},
      time_limit: problem.timeLimit || 1000,
      memory_limit: problem.memoryLimit || 128,
      assigned_to_years: Array.isArray(problem.assignedToYears) ? problem.assignedToYears : [],
      assigned_to_departments: Array.isArray(problem.assignedToDepartments) ? problem.assignedToDepartments : []
    }));

    // Insert problems into database
    const { data: insertedProblems, error } = await supabase
      .from('problems')
      .insert(validatedProblems)
      .select();

    if (error) {
      console.error('Bulk insert error:', error);
      return res.status(500).json({
        error: 'Failed to upload problems',
        message: 'An error occurred while saving the problems'
      });
    }

    res.json({
      message: `Successfully uploaded ${insertedProblems.length} problems`,
      problems: insertedProblems
    });

  } catch (error) {
    console.error('Upload problems error:', error);
    res.status(500).json({
      error: 'Failed to upload problems',
      message: 'An error occurred while processing the file'
    });
  }
});

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;

    // Get user statistics
    const { data: userStats } = await supabase
      .from('users')
      .select('role, status, branch, year')
      .eq('role', 'student');

    // Get problem statistics
    const { data: problemStats } = await supabase
      .from('problems')
      .select('difficulty, topics');

    // Get submission statistics
    const { data: submissionStats } = await supabase
      .from('submissions')
      .select('status, submitted_at');

    // Calculate statistics
    const totalUsers = userStats?.length || 0;
    const pendingUsers = userStats?.filter(u => u.status === 'pending').length || 0;
    const approvedUsers = userStats?.filter(u => u.status === 'approved').length || 0;
    const totalProblems = problemStats?.length || 0;
    const totalSubmissions = submissionStats?.length || 0;

    // Branch-wise statistics
    const branchStats = userStats?.reduce((acc, user) => {
      if (user.branch) {
        acc[user.branch] = (acc[user.branch] || 0) + 1;
      }
      return acc;
    }, {}) || {};

    // Year-wise statistics
    const yearStats = userStats?.reduce((acc, user) => {
      if (user.year) {
        acc[user.year] = (acc[user.year] || 0) + 1;
      }
      return acc;
    }, {}) || {};

    // Difficulty-wise problem statistics
    const difficultyStats = problemStats?.reduce((acc, problem) => {
      acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
      return acc;
    }, {}) || {};

    res.json({
      users: {
        total: totalUsers,
        pending: pendingUsers,
        approved: approvedUsers,
        byBranch: branchStats,
        byYear: yearStats
      },
      problems: {
        total: totalProblems,
        byDifficulty: difficultyStats
      },
      submissions: {
        total: totalSubmissions
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: 'An error occurred while loading dashboard statistics'
    });
  }
});

// Helper function to parse CSV
async function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => {
        // Convert CSV row to problem object
        const problem = {
          title: data.title || data.Title,
          description: data.description || data.Description || '',
          difficulty: data.difficulty || data.Difficulty || 'Medium',
          constraints: data.constraints ? data.constraints.split(',').map(c => c.trim()) : [],
          topics: data.topics ? data.topics.split(',').map(t => t.trim()) : [],
          tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
          examples: data.examples ? JSON.parse(data.examples) : [],
          testCases: data.testCases ? JSON.parse(data.testCases) : [],
          codeTemplates: data.codeTemplates ? JSON.parse(data.codeTemplates) : {},
          timeLimit: parseInt(data.timeLimit) || 1000,
          memoryLimit: parseInt(data.memoryLimit) || 128,
          assignedToYears: data.assignedToYears ? data.assignedToYears.split(',').map(y => y.trim()) : [],
          assignedToDepartments: data.assignedToDepartments ? data.assignedToDepartments.split(',').map(d => d.trim()) : []
        };
        results.push(problem);
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

module.exports = router;
