"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FilePlus2, FileSpreadsheet, CalendarPlus, Trophy, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Simple type for the form
type ExampleItem = { input: string; output: string; explanation: string };
type TestCaseItem = { input: string; expectedOutput: string; isHidden: boolean };

type ProblemForm = {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "";
  topicsText: string; // comma-separated
  tagsText: string; // comma-separated
  constraintsText: string; // newline separated
  examples: ExampleItem[];
  testCases: TestCaseItem[];
  codeTemplates: {
    javaTemplate: string;
    cppTemplate: string;
    pythonTemplate: string;
    cTemplate: string;
  };
};

type ProblemItem = {
  id: string;
  title: string;
  difficulty: string;
  year: string;
  branch: string;
  createdAt?: string;
  type?: string;
};

function AddProblemContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ProblemForm>({
    title: "",
    description: "",
    difficulty: "",
    topicsText: "",
    tagsText: "",
    constraintsText: "",
    examples: [
      { input: "", output: "", explanation: "" },
    ],
    testCases: [
      { input: "", expectedOutput: "", isHidden: false },
    ],
    codeTemplates: {
      javaTemplate: "",
      cppTemplate: "",
      pythonTemplate: "",
      cTemplate: "",
    },
  });

  // Draft state for template editor dialog
  const [templateDraft, setTemplateDraft] = useState({
    javaTemplate: "",
    cppTemplate: "",
    pythonTemplate: "",
    cTemplate: "",
  });
  const [templateOpen, setTemplateOpen] = useState(false);

  // Basic line-numbered editor using a textarea and a synced gutter
  const LineNumberEditor: React.FC<{
    value: string;
    onChange: (v: string) => void;
    minRows?: number;
  }> = ({ value, onChange, minRows = 18 }) => {
    const taRef = useRef<HTMLTextAreaElement | null>(null);
    const gutterRef = useRef<HTMLDivElement | null>(null);
    const lines = Math.max(value.split("\n").length, minRows);

    useEffect(() => {
      const ta = taRef.current;
      const gut = gutterRef.current;
      if (!ta || !gut) return;
      const onScroll = () => {
        gut.scrollTop = ta.scrollTop;
      };
      ta.addEventListener("scroll", onScroll);
      return () => ta.removeEventListener("scroll", onScroll);
    }, []);

    return (
      <div className="flex border rounded-md overflow-hidden">
        <div
          ref={gutterRef}
          className="bg-muted/40 text-muted-foreground select-none text-xs leading-6 px-3 py-2 border-r min-w-[3rem] text-right overflow-hidden"
          style={{ maxHeight: 400 }}
        >
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={taRef}
          className="font-mono w-full text-sm leading-6 p-2 outline-none bg-transparent min-h-[300px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      </div>
    );
  };

  const handleChange = (key: keyof ProblemForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value } as ProblemForm));
  };

  const fetchProblems = async () => {
    try {
      setListLoading(true);
      const token = user?.token || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);
      const res = await fetch("http://localhost:4545/api/admin/problems", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to load problems (${res.status})`);
      const data = await res.json();
      const items: ProblemItem[] = Array.isArray(data)
        ? data.map((p: any) => ({
            id: String(p.id || p._id || crypto.randomUUID()),
            title: p.title || "Untitled",
            difficulty: p.difficulty || "-",
            year: p.year || "-",
            branch: p.branch || "-",
            createdAt: p.createdAt,
            type: p.type,
          }))
        : [];
      setProblems(items);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to load problems", variant: "destructive" });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProblems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return problems;
    return problems.filter((p) =>
      p.title.toLowerCase().includes(q) || p.difficulty.toLowerCase().includes(q) || p.branch.toLowerCase().includes(q) || p.year.toLowerCase().includes(q)
    );
  }, [problems, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.difficulty) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const token = user?.token || (typeof window !== "undefined" ? localStorage.getItem("token") || undefined : undefined);
      const normalize = (s: string) => (s ?? "").replace(/\r\n/g, "\n");
      const payload = {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        topics: form.topicsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        examples: form.examples.filter(ex => ex.input || ex.output || ex.explanation),
        testCases: form.testCases.filter(tc => tc.input || tc.expectedOutput).map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: !!tc.isHidden,
        })),
        constraints: form.constraintsText
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean),
        tags: form.tagsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        codeTemplates: {
          javaTemplate: normalize(form.codeTemplates.javaTemplate),
          cppTemplate: normalize(form.codeTemplates.cppTemplate),
          pythonTemplate: normalize(form.codeTemplates.pythonTemplate),
          cTemplate: normalize(form.codeTemplates.cTemplate),
        },
      };

      const res = await fetch("http://localhost:4545/api/admin/problems/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Failed to create problem (${res.status})`);
      }

      toast({ title: "Problem added", description: "The problem statement has been created successfully." });
      setForm({
        title: "",
        description: "",
        difficulty: "",
        topicsText: "",
        tagsText: "",
        constraintsText: "",
        examples: [{ input: "", output: "", explanation: "" }],
        testCases: [{ input: "", expectedOutput: "", isHidden: false }],
        codeTemplates: { javaTemplate: "", cppTemplate: "", pythonTemplate: "", cTemplate: "" },
      });
      // refresh list
      await fetchProblems();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to add problem", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left: Add single problem */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-md bg-accent/10">
                <FilePlus2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle>Add Problem Statement</CardTitle>
                <CardDescription>Create a new problem for students to solve</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter a concise title"
              />
            </div>

            <div>
              <Label htmlFor="topics">Topics</Label>
              <Input
                id="topics"
                value={form.topicsText}
                onChange={(e) => handleChange("topicsText", e.target.value)}
                placeholder="Comma-separated, e.g., array, hash-table, two-pointers"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the problem, constraints and examples"
                rows={8}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => handleChange("difficulty", v as ProblemForm["difficulty"]) }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">EASY</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                    <SelectItem value="HARD">HARD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" value={form.tagsText} onChange={(e) => handleChange("tagsText", e.target.value)} placeholder="Comma-separated, e.g., beginner, interview" />
              </div>
              <div>
                <Label htmlFor="constraints">Constraints</Label>
                <Textarea id="constraints" value={form.constraintsText} onChange={(e) => handleChange("constraintsText", e.target.value)} placeholder="One per line" rows={3} />
              </div>
            </div>

            {/* Examples */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Examples</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => handleChange("examples", [...form.examples, { input: "", output: "", explanation: "" }])}>Add Example</Button>
              </div>
              {form.examples.map((ex, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="Input" value={ex.input} onChange={(e) => {
                    const next = [...form.examples]; next[idx] = { ...next[idx], input: e.target.value }; handleChange("examples", next);
                  }} />
                  <Input placeholder="Output" value={ex.output} onChange={(e) => {
                    const next = [...form.examples]; next[idx] = { ...next[idx], output: e.target.value }; handleChange("examples", next);
                  }} />
                  <Input placeholder="Explanation" value={ex.explanation} onChange={(e) => {
                    const next = [...form.examples]; next[idx] = { ...next[idx], explanation: e.target.value }; handleChange("examples", next);
                  }} />
                </div>
              ))}
            </div>

            {/* Test Cases */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Test Cases</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => handleChange("testCases", [...form.testCases, { input: "", expectedOutput: "", isHidden: false }])}>Add Test Case</Button>
              </div>
              {form.testCases.map((tc, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] items-center gap-3">
                  <Input placeholder="Input" value={tc.input} onChange={(e) => {
                    const next = [...form.testCases]; next[idx] = { ...next[idx], input: e.target.value }; handleChange("testCases", next);
                  }} />
                  <Input placeholder="Expected Output" value={tc.expectedOutput} onChange={(e) => {
                    const next = [...form.testCases]; next[idx] = { ...next[idx], expectedOutput: e.target.value }; handleChange("testCases", next);
                  }} />
                  <div className="flex items-center gap-2">
                    <Checkbox id={`hidden-${idx}`} checked={tc.isHidden} onCheckedChange={(v) => {
                      const next = [...form.testCases]; next[idx] = { ...next[idx], isHidden: Boolean(v) }; handleChange("testCases", next);
                    }} />
                    <label htmlFor={`hidden-${idx}`} className="text-sm text-muted-foreground">Hidden</label>
                  </div>
                </div>
              ))}
            </div>

            {/* Code Templates */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Code Templates</Label>
                <Dialog open={templateOpen} onOpenChange={(o) => {
                  setTemplateOpen(o);
                  if (o) {
                    setTemplateDraft({ ...form.codeTemplates });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="secondary">Open Template Editor</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl">
                    <DialogHeader>
                      <DialogTitle>Template Editor</DialogTitle>
                      <DialogDescription>Paste or write starter code. New lines will be sent as \n.</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="java">
                      <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="java">Java</TabsTrigger>
                        <TabsTrigger value="cpp">C++</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="c">C</TabsTrigger>
                      </TabsList>
                      <TabsContent value="java">
                        <LineNumberEditor value={templateDraft.javaTemplate} onChange={(v) => setTemplateDraft((d) => ({ ...d, javaTemplate: v }))} />
                      </TabsContent>
                      <TabsContent value="cpp">
                        <LineNumberEditor value={templateDraft.cppTemplate} onChange={(v) => setTemplateDraft((d) => ({ ...d, cppTemplate: v }))} />
                      </TabsContent>
                      <TabsContent value="python">
                        <LineNumberEditor value={templateDraft.pythonTemplate} onChange={(v) => setTemplateDraft((d) => ({ ...d, pythonTemplate: v }))} />
                      </TabsContent>
                      <TabsContent value="c">
                        <LineNumberEditor value={templateDraft.cTemplate} onChange={(v) => setTemplateDraft((d) => ({ ...d, cTemplate: v }))} />
                      </TabsContent>
                    </Tabs>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setTemplateOpen(false)}>Cancel</Button>
                      <Button type="button" onClick={() => {
                        handleChange("codeTemplates", { ...templateDraft });
                        setTemplateOpen(false);
                      }}>Save Templates</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading} className="inline-flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Create Problem</span>
            </Button>
            <Button type="button" variant="outline" onClick={() => setForm({
              title: "",
              description: "",
              difficulty: "",
              topicsText: "",
              tagsText: "",
              constraintsText: "",
              examples: [{ input: "", output: "", explanation: "" }],
              testCases: [{ input: "", expectedOutput: "", isHidden: false }],
              codeTemplates: { javaTemplate: "", cppTemplate: "", pythonTemplate: "", cTemplate: "" },
            })}>
              Reset
            </Button>
          </div>
              </form>
            </CardContent>
          </Card>

          {/* Right: Excel upload, Daily problem, Contest problem */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 rounded-md bg-accent/10">
                  <FileSpreadsheet className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Add Problems via Excel</CardTitle>
                  <CardDescription>Bulk upload from .xlsx or .csv</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input type="file" accept=".xlsx,.csv" />
                  <Button type="button" onClick={() => toast({ title: "Coming soon", description: "Bulk upload API not wired yet." })}>
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 rounded-md bg-accent/10">
                  <CalendarPlus className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Add Daily Problem</CardTitle>
                  <CardDescription>Quickly schedule today's problem</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Input placeholder="Title" />
                  <Button type="button" onClick={() => toast({ title: "Daily problem", description: "Hook to backend as needed." })}>Add</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 rounded-md bg-accent/10">
                  <Trophy className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Add Contest Problem</CardTitle>
                  <CardDescription>Create a problem for an upcoming contest</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Input placeholder="Title" />
                  <Button type="button" onClick={() => toast({ title: "Contest problem", description: "Hook to backend as needed." })}>Add</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Problems section */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle>All Problems</CardTitle>
              <CardDescription>Search and review existing problems</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, branch, year, difficulty" className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            {listLoading ? (
              <div className="py-8 text-sm text-muted-foreground">Loading problems...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProblems.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell>{p.difficulty}</TableCell>
                        <TableCell>{p.year}</TableCell>
                        <TableCell>{p.branch}</TableCell>
                        <TableCell>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                    {filteredProblems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No problems found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminProblemsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AddProblemContent />
    </ProtectedRoute>
  );
}
