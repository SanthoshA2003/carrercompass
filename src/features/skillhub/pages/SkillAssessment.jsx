import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Code2,
  Lightbulb,
  Play,
  Send,
} from "lucide-react";
import Shell from "@/features/skillhub/components/Shell";

// ======================================================
// DUMMY DATA
// Later this entire object can come from API
// ======================================================

const DUMMY_ASSESSMENTS = {
  "technical-skills": {
    title: "Technical Skills",
    description: "Programming and technical knowledge-based challenges.",
    icon: Code2,
    color: "cyan",
    questions: [
      {
        id: "tech-1",
        title: "Reverse a String",
        problem:
          "Write a program that takes a string as input and prints the string in reverse order.",
        instructions:
          "Read a string from the user and print the reversed string. Do not use a built-in reverse function.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        String input = sc.nextLine();

        // Write your code here

    }
}`,
      },
      {
        id: "tech-2",
        title: "Find the Largest Number",
        problem:
          "Given three integers, find and print the largest number.",
        instructions:
          "Read three integers and determine the largest value using conditional logic.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        // Write your code here

    }
}`,
      },
      {
        id: "tech-3",
        title: "Count Vowels",
        problem:
          "Write a program to count the number of vowels present in a given string.",
        instructions:
          "Consider a, e, i, o and u as vowels. The program should work for both uppercase and lowercase characters.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        String input = sc.nextLine();

        // Write your code here

    }
}`,
      },
      {
        id: "tech-4",
        title: "Check Prime Number",
        problem:
          "Write a program to determine whether a given number is prime.",
        instructions:
          "Print Prime if the number is prime; otherwise print Not Prime.",
        language: "Java",
        difficulty: "Intermediate",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int number = sc.nextInt();

        // Write your code here

    }
}`,
      },
      {
        id: "tech-5",
        title: "Find Duplicate Elements",
        problem:
          "Given an integer array, find and print the duplicate elements.",
        instructions:
          "Read the array and identify values that occur more than once.",
        language: "Java",
        difficulty: "Intermediate",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Read array and find duplicates

    }
}`,
      },
    ],
  },

  "problem-solving": {
    title: "Problem Solving",
    description: "Logic, algorithms and practical problem-solving challenges.",
    icon: Lightbulb,
    color: "violet",
    questions: [
      {
        id: "problem-1",
        title: "Two Sum",
        problem:
          "Given an array of integers and a target value, find two numbers whose sum equals the target.",
        instructions:
          "Print the indexes of the two numbers that produce the target sum.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Write your solution here

    }
}`,
      },
      {
        id: "problem-2",
        title: "Missing Number",
        problem:
          "An array contains numbers from 1 to N with one number missing. Find the missing number.",
        instructions:
          "Return the missing number without sorting the array.",
        language: "Java",
        difficulty: "Intermediate",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Write your solution here

    }
}`,
      },
      {
        id: "problem-3",
        title: "Palindrome Number",
        problem:
          "Determine whether a given integer reads the same forward and backward.",
        instructions:
          "Print Palindrome or Not Palindrome.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Write your solution here

    }
}`,
      },
      {
        id: "problem-4",
        title: "Frequency of Elements",
        problem:
          "Given an integer array, find the frequency of each element.",
        instructions:
          "Print every unique number along with the number of times it appears.",
        language: "Java",
        difficulty: "Intermediate",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Write your solution here

    }
}`,
      },
      {
        id: "problem-5",
        title: "Maximum Subarray Sum",
        problem:
          "Find the contiguous subarray with the maximum possible sum.",
        instructions:
          "Print the maximum subarray sum.",
        language: "Java",
        difficulty: "Advanced",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Write your solution here

    }
}`,
      },
    ],
  },

  "critical-thinking": {
    title: "Critical Thinking",
    description: "Reasoning, analysis and decision-making challenges.",
    icon: Brain,
    color: "purple",
    questions: [
      {
        id: "critical-1",
        title: "Analyze a Sorting Problem",
        problem:
          "A program sorts a large list of numbers but becomes very slow as the input grows.",
        instructions:
          "Explain and implement a more efficient approach for handling large inputs.",
        language: "Java",
        difficulty: "Intermediate",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Analyze the problem
        // Write your solution here

    }
}`,
      },
      {
        id: "critical-2",
        title: "Optimize Search",
        problem:
          "A system searches through thousands of sorted records for a specific value.",
        instructions:
          "Implement an efficient search algorithm and explain why it is suitable.",
        language: "Java",
        difficulty: "Intermediate",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Write your solution here

    }
}`,
      },
      {
        id: "critical-3",
        title: "Detect Invalid Input",
        problem:
          "A program accepts numbers from users, but invalid values can cause unexpected behavior.",
        instructions:
          "Write a solution that validates the input before processing it.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Validate input

    }
}`,
      },
      {
        id: "critical-4",
        title: "Choose the Right Data Structure",
        problem:
          "A system frequently searches for users by their unique ID.",
        instructions:
          "Choose a suitable data structure and implement a basic lookup operation.",
        language: "Java",
        difficulty: "Intermediate",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Implement efficient lookup

    }
}`,
      },
      {
        id: "critical-5",
        title: "Debug the Logic",
        problem:
          "A program produces incorrect output even though it compiles successfully.",
        instructions:
          "Identify the logical problem and correct the implementation.",
        language: "Java",
        difficulty: "Intermediate",
        points: 10,
        starterCode: `public class Main {
    public static void main(String[] args) {

        int total = 10;
        int count = 0;

        // Find and fix the logic problem

        System.out.println(total / count);
    }
}`,
      },
    ],
  },

  "interview-readiness": {
    title: "Interview Readiness",
    description:
      "Interview preparation, technical explanation and workplace scenarios.",
    icon: Code2,
    color: "emerald",
    questions: [
      {
        id: "interview-1",
        title: "Implement a Simple API Model",
        problem:
          "Create a Java class representing a Student with name, email and age.",
        instructions:
          "Create the class with appropriate fields, constructor and getter methods.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `public class Main {

    // Create Student class here

    public static void main(String[] args) {

    }
}`,
      },
      {
        id: "interview-2",
        title: "StringBuilder Usage",
        problem:
          "Build a program that efficiently concatenates multiple strings.",
        instructions:
          "Use StringBuilder instead of repeatedly concatenating strings.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `public class Main {
    public static void main(String[] args) {

        // Use StringBuilder

    }
}`,
      },
      {
        id: "interview-3",
        title: "Exception Handling",
        problem:
          "Write a program that safely handles division by zero.",
        instructions:
          "Use Java exception handling and display a meaningful message.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `public class Main {
    public static void main(String[] args) {

        int a = 10;
        int b = 0;

        // Handle the exception

    }
}`,
      },
      {
        id: "interview-4",
        title: "Find Second Largest",
        problem:
          "Find the second largest number in an integer array.",
        instructions:
          "Solve the problem without sorting the complete array.",
        language: "Java",
        difficulty: "Intermediate",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        int[] numbers = {10, 25, 5, 40, 30};

        // Find second largest

    }
}`,
      },
      {
        id: "interview-5",
        title: "Object-Oriented Design",
        problem:
          "Create a simple BankAccount class with deposit and withdrawal operations.",
        instructions:
          "Use encapsulation and prevent withdrawal when the balance is insufficient.",
        language: "Java",
        difficulty: "Intermediate",
        points: 10,
        starterCode: `public class Main {

    // Create BankAccount class

    public static void main(String[] args) {

    }
}`,
      },
    ],
  },

  "soft-skills": {
    title: "Soft Skills",
    description:
      "Communication, teamwork, leadership and professional situations.",
    icon: Brain,
    color: "orange",
    questions: [
      {
        id: "soft-1",
        title: "Team Communication",
        problem:
          "Write a program that stores team member names and prints them in a structured format.",
        instructions:
          "Focus on writing clean and readable code that another team member can easily understand.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        String[] team = {
            "Arun",
            "Priya",
            "Rahul"
        };

        // Display team members

    }
}`,
      },
      {
        id: "soft-2",
        title: "Clear Information Processing",
        problem:
          "Create a program that accepts a list of tasks and displays them clearly.",
        instructions:
          "Organize the output so that another person can easily understand the task list.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Process and display tasks

    }
}`,
      },
      {
        id: "soft-3",
        title: "Prioritize Tasks",
        problem:
          "Given tasks with different priorities, display them from highest to lowest priority.",
        instructions:
          "Implement a simple sorting approach based on priority.",
        language: "Java",
        difficulty: "Intermediate",
        points: 10,
        starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {

        // Process task priorities

    }
}`,
      },
      {
        id: "soft-4",
        title: "Collaborative Data Handling",
        problem:
          "Create a program that combines information from two team members.",
        instructions:
          "Write clean code that demonstrates how data can be combined and displayed.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `public class Main {
    public static void main(String[] args) {

        // Combine team information

    }
}`,
      },
      {
        id: "soft-5",
        title: "Problem Explanation",
        problem:
          "Create a program that calculates the average completion percentage of a team.",
        instructions:
          "Write readable code and clearly structure the calculation.",
        language: "Java",
        difficulty: "Beginner",
        points: 10,
        starterCode: `public class Main {
    public static void main(String[] args) {

        int[] completion = {
            80, 70, 90
        };

        // Calculate average

    }
}`,
      },
    ],
  },
};

// ======================================================
// SECTION LIST
// ======================================================

const SECTIONS = Object.entries(DUMMY_ASSESSMENTS).map(
  ([id, section]) => ({
    id,
    ...section,
  })
);

// ======================================================
// COMPONENT
// ======================================================

export default function SkillAssessment() {
  const [selectedSection, setSelectedSection] = useState(
    "technical-skills"
  );

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [code, setCode] = useState("");

  const [submitted, setSubmitted] = useState({});

  const [runMessage, setRunMessage] = useState("");

  const section = DUMMY_ASSESSMENTS[selectedSection];

  const question = section.questions[currentQuestion];

  // Initialize code whenever question changes
  const currentCode =
    code ||
    question.starterCode;

  // ====================================================
  // SELECT SECTION
  // ====================================================

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    setCurrentQuestion(0);
    setCode("");
    setRunMessage("");
  };

  // ====================================================
  // CHANGE QUESTION
  // ====================================================

  const handleQuestionChange = (index) => {
    setCurrentQuestion(index);
    setCode("");
    setRunMessage("");
  };

  const handleNext = () => {
  const isLastQuestion =
    currentQuestion === section.questions.length - 1;

  const isLastSection =
    selectedSection === SECTIONS[SECTIONS.length - 1].id;

  // Move to next question
  if (!isLastQuestion) {
    handleQuestionChange(currentQuestion + 1);
    return;
  }

  // Last question of current section
  if (!isLastSection) {
    const currentSectionIndex = SECTIONS.findIndex(
      (item) => item.id === selectedSection
    );

    const nextSection = SECTIONS[currentSectionIndex + 1];

    setSelectedSection(nextSection.id);
    setCurrentQuestion(0);
    setCode("");
    setRunMessage("");

    return;
  }

  // All sections completed
  setRunMessage(
    "Assessment completed successfully. Your final score will be calculated."
  );
};


const handlePrevious = () => {
  // Go to previous question in the same section
  if (currentQuestion > 0) {
    handleQuestionChange(currentQuestion - 1);
    return;
  }

  // If first question of current section,
  // move to the previous section's last question
  const currentSectionIndex = SECTIONS.findIndex(
    (item) => item.id === selectedSection
  );

  if (currentSectionIndex > 0) {
    const previousSection =
      SECTIONS[currentSectionIndex - 1];

    setSelectedSection(previousSection.id);

    setCurrentQuestion(
      previousSection.questions.length - 1
    );

    setCode("");
    setRunMessage("");
  }
};

  // ====================================================
  // RUN CODE - DUMMY FOR NOW
  // ====================================================

  const handleRunCode = () => {
    setRunMessage(
      "Code execution is currently in demo mode. API integration will be added later."
    );
  };

  // ====================================================
  // SUBMIT - DUMMY FOR NOW
  // ====================================================

  const handleSubmit = () => {
    setSubmitted((previous) => ({
      ...previous,
      [question.id]: true,
    }));

    setRunMessage(
      "Answer submitted successfully. Score calculation will be connected to the API later."
    );
  };

  return (
  <Shell>
    <div className="flex h-[calc(100vh-80px)] min-h-0 flex-col overflow-hidden bg-[#020617]">

      {/* ==================================================
          TOP ASSESSMENT HEADER
      ================================================== */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0b1120] px-5 py-3">

        <div className="flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/20">
            <Code2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Skill Assessment
            </p>

            <h1 className="text-lg font-black text-white">
              {section.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
  {/* Questions */}
  <div className="flex items-center gap-2">
    <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
      Questions
    </span>

    {section.questions.map((questionItem, index) => (
      <button
        key={questionItem.id}
        type="button"
        onClick={() => handleQuestionChange(index)}
        title={`Question ${index + 1}`}
        className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-bold transition ${
          index === currentQuestion
            ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
            : submitted[questionItem.id]
            ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/20"
            : "border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/10 hover:text-white"
        }`}
      >
        {submitted[questionItem.id] ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          index + 1
        )}
      </button>
    ))}
  </div>

  {/* Points */}
  <div className="rounded-xl bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300">
    {question.points} Points
  </div>
</div>
      </div>


      {/* ==================================================
          QUESTION + CODE WORKSPACE
      ================================================== */}
      <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[42%_58%]">

        {/* ==================================================
            LEFT - CHALLENGE
        ================================================== */}
        <div className="modal-scrollbar min-h-0 overflow-y-auto border-r border-white/10 bg-[#070d1c]">

          <div className="p-6 lg:p-8">

            {/* Challenge heading */}
            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Challenge
                </p>

                <h2 className="mt-2 text-2xl font-black leading-tight text-white">
                  {question.title}
                </h2>
              </div>

              <span className="shrink-0 rounded-full bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-300">
                {question.difficulty}
              </span>

            </div>


            {/* Problem */}
            <div className="mt-8">

              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Problem
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                {question.problem}
              </p>

            </div>


            {/* Instructions */}
            <div className="mt-7 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-5">

              <div className="flex items-center gap-2">

                <Lightbulb className="h-4 w-4 text-cyan-400" />

                <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Instructions
                </p>

              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {question.instructions}
              </p>

            </div>


            {/* Language / Difficulty */}
            <div className="mt-6 flex flex-wrap gap-2">

              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300">
                {question.language}
              </span>

              <span className="rounded-lg border border-violet-400/10 bg-violet-400/[0.05] px-3 py-1.5 text-xs font-semibold text-violet-300">
                {question.difficulty}
              </span>

              <span className="rounded-lg border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-1.5 text-xs font-semibold text-emerald-300">
                {question.points} Points
              </span>

            </div>

          </div>
        </div>


        {/* ==================================================
            RIGHT - CODE EDITOR
        ================================================== */}
        <div className="flex min-h-0 overflow-hidden flex-col bg-[#0b1120]">

          {/* Editor header */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0b1120] px-5 py-3">

            <div className="flex items-center gap-3">

              <Code2 className="h-4 w-4 text-cyan-400" />

              <span className="rounded-lg bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-slate-300">
                {question.language}
              </span>

            </div>

            <span className="text-[11px] font-medium text-slate-600">
              Coding Workspace
            </span>

          </div>


          {/* Code editor */}
          <div className="min-h-0 flex-1 overflow-hidden">

           <textarea
  value={currentCode}
  onChange={(e) => {
    setCode(e.target.value);
    setRunMessage("");
  }}
  spellCheck={false}
  className="modal-scrollbar block h-full min-h-0 w-full resize-none border-0 bg-[#080d19] p-5 font-mono text-sm leading-7 text-slate-200 outline-none"
/>

          </div>


          {/* ==================================================
              TEST CASES / OUTPUT
          ================================================== */}
          <div className="shrink-0 border-t border-white/10 bg-[#080d19]">

            <div className="flex items-center gap-6 border-b border-white/10 px-5 py-3">

              <button
                type="button"
                className="border-b-2 border-cyan-400 pb-2 text-xs font-bold text-cyan-400"
              >
                TEST CASES
              </button>

              <button
                type="button"
                className="pb-2 text-xs font-bold text-slate-500 hover:text-slate-300"
              >
                OUTPUT
              </button>

            </div>


            <div className="h-[105px] overflow-auto p-5">

              {runMessage ? (
                <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] p-4">
                  <p className="text-xs leading-6 text-slate-400">
                    {runMessage}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Test Case
                    </p>

                    <div className="mt-2 rounded-lg bg-white/[0.03] px-3 py-2 font-mono text-xs text-slate-400">
                      Sample Input
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Expected Output
                    </p>

                    <div className="mt-2 rounded-lg bg-white/[0.03] px-3 py-2 font-mono text-xs text-emerald-300">
                      Sample Output
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>


          {/* ==================================================
              EDITOR ACTIONS
          ================================================== */}
          <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#0b1120] px-5 py-4">

            <button
              type="button"
              onClick={() => {
                setCode("");
                setRunMessage("");
              }}
              className="text-xs font-semibold text-slate-500 transition hover:text-white"
            >
              Reset Code
            </button>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={handleRunCode}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Play className="h-4 w-4" />
                Run Code
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition hover:opacity-90"
              >
                <Send className="h-4 w-4" />
                Submit
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          BOTTOM NAVIGATION
      ================================================== */}
      <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#0b1120] px-5 py-3">

        <button
          type="button"
          disabled={
  currentQuestion === 0 &&
  selectedSection === SECTIONS[0].id
}
onClick={handlePrevious}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>


        <div className="flex items-center gap-2">

          {section.questions.map((item, index) => (

            <span
              key={item.id}
              className={`h-1.5 rounded-full transition-all ${
                index === currentQuestion
                  ? "w-8 bg-cyan-400"
                  : submitted[item.id]
                  ? "w-5 bg-emerald-400"
                  : "w-5 bg-white/10"
              }`}
            />

          ))}

        </div>


       <button
  type="button"
  onClick={handleNext}
  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
>
  {currentQuestion === section.questions.length - 1
    ? selectedSection === SECTIONS[SECTIONS.length - 1].id
      ? "Finish"
      : "Next Section"
    : "Next"}

  <ArrowRight className="h-4 w-4" />
</button>

      </div>

    </div>
  </Shell>
);
}