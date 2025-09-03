"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function ProblemsPage() {
  const [activeTopic, setActiveTopic] = useState("Array");

  const topics = [
    "Array",
    "String",
    "Linked List",
    "Stack",
    "Queue",
    "Tree",
    "Graph",
    "Dynamic Programming",
    "Greedy",
    "Backtracking",
  ];

  const problemsForTopic: Record<string, string[]> = {
    Array: ["Two Sum", "Maximum Subarray", "Rotate Array"],
    String: ["Valid Palindrome", "Anagram Check", "Substring Search"],
    "Linked List": ["Reverse Linked List", "Detect Cycle", "Merge Two Lists"],
    Stack: ["Valid Parentheses", "Min Stack", "Next Greater Element"],
    Queue: ["Implement Queue", "Circular Queue", "Sliding Window Maximum"],
    Tree: ["Binary Tree Inorder", "Level Order Traversal", "Diameter of Tree"],
    Graph: ["BFS", "DFS", "Dijkstra"],
    "Dynamic Programming": ["Fibonacci", "Longest Increasing Subsequence", "Knapsack"],
    Greedy: ["Activity Selection", "Huffman Coding"],
    Backtracking: ["N-Queens", "Sudoku Solver"],
  };

  // helper to slugify problem names
  const slugify = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">DSA Problems</h1>

      {/* Topics Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTopic(t)}
            className={`px-4 py-2 rounded-lg border text-sm transition ${
              activeTopic === t
                ? "bg-accent text-accent-foreground"
                : "bg-muted hover:bg-accent/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Problems for Topic */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {problemsForTopic[activeTopic].map((pb) => (
          <Link
            key={pb}
            href={`/ide/${slugify(pb)}`}
            className="p-4 rounded-lg bg-card border border-border/60 flex items-center justify-between hover:shadow-md transition"
          >
            <div className="font-medium">{pb}</div>
            <BookOpen className="text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
