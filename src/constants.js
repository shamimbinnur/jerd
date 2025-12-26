export function createDefaultConfig() {
  return {
    editor: getDefaultEditor(),
    jerdPath: "./jerd",
    dateFormat: "YYYY-MM-DD",
    defaultTemplate: "default",
  };
}

export function createDefaultTemplates() {
  return {
    templates: [
      {
        name: "default",
        description: "Simple gratitude and mood tracking",
        sections: [
          {
            type: "auto-date",
            title: "📅 Date",
            format: "dddd, MMMM D, YYYY",
          },
          {
            type: "list",
            title: "🙏 What I'm grateful for",
            items: [],
          },
          {
            type: "text",
            title: "😊 Mood",
            content: "",
          },
          {
            type: "text",
            title: "📝 Notes",
            content: "",
          },
        ],
      },
      {
        name: "daily",
        description: "Full morning/evening reflection with goals",
        sections: [
          {
            type: "text",
            title: "📖 Daily Journal - {{date}}",
            content: "",
          },
          {
            type: "text",
            title: "🏷️ Tags",
            content: "- #tag1 #tag2 #tag3",
          },
          {
            type: "text",
            title: "🌅 Morning Reflection",
            content: "- How do I feel this morning?\n- Top 3 priorities today:\n  1. \n  2. \n  3. ",
          },
          {
            type: "text",
            title: "🙏 Gratitude",
            content: "- 3 things I'm grateful for today:\n  1. \n  2. \n  3. ",
          },
          {
            type: "text",
            title: "🎯 Daily Goals",
            content: "- Goal 1: \n- Goal 2: \n- Goal 3: ",
          },
          {
            type: "text",
            title: "🌙 Evening Reflection",
            content: "- Wins today: \n- Lessons learned: \n- How do I feel tonight? \n- Any adjustments for tomorrow?",
          },
        ],
      },
      {
        name: "mindfulness",
        description: "Wellness and gratitude focused",
        sections: [
          {
            type: "text",
            title: "🧘 Mindfulness Journal - {{date}}",
            content: "",
          },
          {
            type: "text",
            title: "🏷️ Tags",
            content: "- #gratitude #wellness #mindfulness",
          },
          {
            type: "text",
            title: "🙏 Gratitude",
            content: "- Today I am thankful for:\n  1. \n  2. \n  3. ",
          },
          {
            type: "text",
            title: "🧠 Mindfulness Exercise",
            content: "- How present was I today? (1-10):\n- Moments I felt truly present:",
          },
          {
            type: "text",
            title: "✨ Positive Affirmations",
            content: "- Affirmation 1: \n- Affirmation 2: \n- Affirmation 3: ",
          },
          {
            type: "text",
            title: "💭 Reflection",
            content: "- Best moment of the day: \n- Something I want to improve tomorrow:",
          },
        ],
      },
      {
        name: "work",
        description: "Work/project tracking and learnings",
        sections: [
          {
            type: "text",
            title: "💼 Work Journal - {{date}}",
            content: "",
          },
          {
            type: "text",
            title: "🏷️ Tags",
            content: "- #project #tasks #learning",
          },
          {
            type: "text",
            title: "📋 Tasks & Priorities",
            content: "- Top tasks today:\n  1. \n  2. \n  3. ",
          },
          {
            type: "text",
            title: "✅ Progress",
            content: "- What I completed today:",
          },
          {
            type: "text",
            title: "🚧 Challenges / Blockers",
            content: "- Any obstacles faced:",
          },
          {
            type: "text",
            title: "💡 Insights & Learnings",
            content: "- What I learned from today's work:",
          },
          {
            type: "text",
            title: "📅 Tomorrow's Plan",
            content: "- Key tasks for tomorrow:",
          },
        ],
      },
      {
        name: "blank",
        description: "Minimal blank template",
        sections: [
          {
            type: "auto-date",
            title: "📅 Date",
            format: "dddd, MMMM D, YYYY",
          },
          {
            type: "text",
            title: "📝 Notes",
            content: "",
          },
        ],
      },
    ],
  };
}

export function getDefaultEditor() {
  // Respect $EDITOR environment variable if set
  if (process.env.EDITOR) {
    return process.env.EDITOR;
  }

  // Platform-specific defaults
  switch (process.platform) {
    case "win32":
      return "notepad";
    case "darwin":
    case "linux":
    default:
      return "nano";
  }
}
