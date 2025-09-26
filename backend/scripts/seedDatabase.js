const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Set environment variables with your real Supabase credentials
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://bodghiwoduxjzwbzggbx.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZGdoaXdvZHV4anp3YnpnZ2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwNDcxMSwiZXhwIjoyMDc0NDgwNzExfQ.58EXzmdFWHrVO4Bj-EY8mxcsD_4U8sKAyJwp7zhCh28';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample data
const sampleProblems = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    topics: ["Array", "Hash Table"],
    tags: ["leetcode", "array", "hash-table"],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    test_cases: [
      {
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
        hidden: false
      },
      {
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
        hidden: false
      },
      {
        input: "[3,3]\n6",
        expectedOutput: "[0,1]",
        hidden: true
      }
    ],
    code_templates: {
      pythonTemplate: "class Solution:\n    def twoSum(self, nums, target):\n        # TODO: Implement\n        return [0, 0]",
      javaTemplate: "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // TODO: Implement\n        return new int[]{0,0};\n    }\n}",
      cppTemplate: "class Solution{\npublic:\n    vector<int> twoSum(vector<int>& nums, int target){\n        // TODO: Implement\n        return {0,0};\n    }\n};",
      cTemplate: "#include <stdlib.h>\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // TODO: Implement\n    *returnSize = 2;\n    int* ans = (int*)malloc(2 * sizeof(int));\n    ans[0] = 0; ans[1] = 0;\n    return ans;\n}"
    },
    time_limit: 1000,
    memory_limit: 128,
    assigned_to_years: ["First Year", "Second Year"],
    assigned_to_departments: ["CSE", "IT"]
  },
  {
    title: "Add Two Numbers",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
    difficulty: "Medium",
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100]",
      "0 <= Node.val <= 9",
      "It is guaranteed that the list represents a number that does not have leading zeros."
    ],
    topics: ["Linked List", "Math", "Recursion"],
    tags: ["leetcode", "linked-list", "math"],
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807"
      }
    ],
    test_cases: [
      {
        input: "[2,4,3]\n[5,6,4]",
        expectedOutput: "[7,0,8]",
        hidden: false
      }
    ],
    code_templates: {
      pythonTemplate: "class Solution:\n    def addTwoNumbers(self, l1, l2):\n        # TODO: Implement\n        return None",
      javaTemplate: "public class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        // TODO: Implement\n        return null;\n    }\n}",
      cppTemplate: "class Solution{\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2){\n        // TODO: Implement\n        return nullptr;\n    }\n};"
    },
    time_limit: 2000,
    memory_limit: 256,
    assigned_to_years: ["Second Year", "Third Year"],
    assigned_to_departments: ["CSE", "IT"]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "Medium",
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    topics: ["Hash Table", "String", "Sliding Window"],
    tags: ["leetcode", "hash-table", "string", "sliding-window"],
    examples: [
      {
        input: "s = \"abcabcbb\"",
        output: "3",
        explanation: "The answer is \"abc\", with the length of 3."
      }
    ],
    test_cases: [
      {
        input: "\"abcabcbb\"",
        expectedOutput: "3",
        hidden: false
      }
    ],
    code_templates: {
      pythonTemplate: "class Solution:\n    def lengthOfLongestSubstring(self, s):\n        # TODO: Implement\n        return 0",
      javaTemplate: "public class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // TODO: Implement\n        return 0;\n    }\n}",
      cppTemplate: "class Solution{\npublic:\n    int lengthOfLongestSubstring(string s){\n        // TODO: Implement\n        return 0;\n    }\n};"
    },
    time_limit: 2000,
    memory_limit: 256,
    assigned_to_years: ["Third Year", "Final Year"],
    assigned_to_departments: ["CSE", "IT"]
  }
];

const sampleBadges = [
  {
    name: "First Steps",
    description: "Solve your first problem",
    icon_url: "https://example.com/badges/first-steps.png",
    criteria: {
      type: "problems_solved",
      count: 1
    }
  },
  {
    name: "Problem Solver",
    description: "Solve 10 problems",
    icon_url: "https://example.com/badges/problem-solver.png",
    criteria: {
      type: "problems_solved",
      count: 10
    }
  },
  {
    name: "Algorithm Master",
    description: "Solve 50 problems",
    icon_url: "https://example.com/badges/algorithm-master.png",
    criteria: {
      type: "problems_solved",
      count: 50
    }
  },
  {
    name: "Speed Demon",
    description: "Solve a problem in under 5 minutes",
    icon_url: "https://example.com/badges/speed-demon.png",
    criteria: {
      type: "solve_time",
      maxTime: 300 // 5 minutes in seconds
    }
  },
  {
    name: "Perfect Week",
    description: "Solve 7 problems in a week",
    icon_url: "https://example.com/badges/perfect-week.png",
    criteria: {
      type: "weekly_goal",
      count: 7
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Insert sample problems
    console.log('📝 Inserting sample problems...');
    const { data: problems, error: problemsError } = await supabase
      .from('problems')
      .insert(sampleProblems)
      .select();

    if (problemsError) {
      console.error('❌ Error inserting problems:', problemsError);
    } else {
      console.log(`✅ Inserted ${problems.length} problems`);
    }

    // Insert sample badges
    console.log('🏆 Inserting sample badges...');
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .insert(sampleBadges)
      .select();

    if (badgesError) {
      console.error('❌ Error inserting badges:', badgesError);
    } else {
      console.log(`✅ Inserted ${badges.length} badges`);
    }

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
