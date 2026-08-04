const quests = [

  // 🟢 EASY QUESTS

  {
    id: "read_20",
    name: "Read a Book for 20 Minutes",
    difficulty: "Easy",
    reward: 100,
    proofType: "image",
    aiInstruction: "Check for evidence of the user reading a book."
  },

  {
    id: "make_bed",
    name: "Make Your Bed",
    difficulty: "Easy",
    reward: 75,
    proofType: "image",
    aiInstruction: "Check that the bed appears clean and organized."
  },

  {
    id: "drink_water",
    name: "Drink a Glass of Water",
    difficulty: "Easy",
    reward: 50,
    proofType: "image",
    aiInstruction: "Check for a glass or bottle of water."
  },

  {
    id: "outside_10",
    name: "Spend 10 Minutes Outside",
    difficulty: "Easy",
    reward: 100,
    proofType: "image_or_video",
    aiInstruction: "Check that the user is outside or in an outdoor environment."
  },

  {
    id: "organize_desk",
    name: "Organize Your Desk",
    difficulty: "Easy",
    reward: 100,
    proofType: "image",
    aiInstruction: "Check that a desk or workspace appears organized."
  },

  {
    id: "learn_something",
    name: "Learn Something New",
    difficulty: "Easy",
    reward: 100,
    proofType: "image",
    aiInstruction: "Check for evidence of learning such as notes or research."
  },

  {
    id: "write_goals",
    name: "Write Down Your Goals",
    difficulty: "Easy",
    reward: 100,
    proofType: "image",
    aiInstruction: "Check for written personal goals."
  },

  {
    id: "clean_area",
    name: "Clean a Small Area",
    difficulty: "Easy",
    reward: 125,
    proofType: "image_or_video",
    aiInstruction: "Check that an area has been cleaned."
  },


  // 🟡 MEDIUM QUESTS

  {
    id: "write_paragraph",
    name: "Write a Paragraph",
    difficulty: "Medium",
    reward: 200,
    proofType: "image",
    aiInstruction: "Check for a completed written paragraph."
  },

  {
    id: "read_50",
    name: "Read 50 Pages",
    difficulty: "Medium",
    reward: 300,
    proofType: "image",
    aiInstruction: "Check for evidence of reading a book."
  },

  {
    id: "cook_food",
    name: "Make Something to Eat",
    difficulty: "Medium",
    reward: 250,
    proofType: "image",
    aiInstruction: "Check for prepared food or a completed meal."
  },

  {
    id: "practice_skill",
    name: "Practice a Skill for 30 Minutes",
    difficulty: "Medium",
    reward: 300,
    proofType: "video",
    aiInstruction: "Check that the user is practicing a skill."
  },

  {
    id: "exercise_session",
    name: "Complete an Exercise Session",
    difficulty: "Medium",
    reward: 300,
    proofType: "video",
    aiInstruction: "Check for evidence of exercise activity."
  },

  {
    id: "solve_puzzle",
    name: "Solve a Puzzle",
    difficulty: "Medium",
    reward: 250,
    proofType: "image",
    aiInstruction: "Check for evidence of completing a puzzle or brain challenge."
  },

  {
    id: "help_someone",
    name: "Help Someone",
    difficulty: "Medium",
    reward: 350,
    proofType: "image_or_video",
    aiInstruction: "Check for evidence of helping another person."
  },


  // 🔴 HARD QUESTS

  {
    id: "read_100",
    name: "Read 100 Pages",
    difficulty: "Hard",
    reward: 700,
    proofType: "image",
    aiInstruction: "Check for evidence of reading a large amount of a book."
  },

  {
    id: "deep_clean",
    name: "Deep Clean an Area",
    difficulty: "Hard",
    reward: 750,
    proofType: "image_or_video",
    aiInstruction: "Compare before and after evidence of cleaning."
  },

  {
    id: "skill_improvement",
    name: "Improve a Skill",
    difficulty: "Hard",
    reward: 800,
    proofType: "video",
    aiInstruction: "Check for evidence showing improvement in a skill."
  },

  {
    id: "30_day_goal",
    name: "Complete a Personal Goal",
    difficulty: "Hard",
    reward: 1000,
    proofType: "image_or_video",
    aiInstruction: "Check for evidence that a personal goal was completed."
  },

  {
    id: "seven_day_streak",
    name: "Complete a 7 Day Challenge",
    difficulty: "Hard",
    reward: 1000,
    proofType: "image_or_video",
    aiInstruction: "Check for progress evidence across multiple days."
  },


  // 👑 LEGENDARY QUESTS

  {
    id: "master_skill",
    name: "Master a New Skill",
    difficulty: "Legendary",
    reward: 1500,
    proofType: "video",
    aiInstruction: "Check for evidence of learning and demonstrating a new skill."
  },

  {
    id: "major_goal",
    name: "Achieve a Major Goal",
    difficulty: "Legendary",
    reward: 2000,
    proofType: "image_or_video",
    aiInstruction: "Check for evidence of completing a significant achievement."
  },

  {
    id: "community_help",
    name: "Help Your Community",
    difficulty: "Legendary",
    reward: 2000,
    proofType: "image_or_video",
    aiInstruction: "Check for evidence of meaningful community help."
  },

  {
    id: "seven_skills",
    name: "Complete 7 Different Quests",
    difficulty: "Legendary",
    reward: 2500,
    proofType: "image",
    aiInstruction: "Check for evidence of completing multiple quests."
  },

  {
    id: "ultimate_quest",
    name: "The Ultimate Quest",
    difficulty: "Legendary",
    reward: 5000,
    proofType: "image_or_video",
    aiInstruction: "Check for evidence of an impressive personal achievement."
  }

];

export default quests;