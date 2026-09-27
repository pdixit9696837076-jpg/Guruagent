(() => {
  const HISTORY_KEY = "practiceHistory";
  const PLAN_STATE_KEY = "learning-plan";
  const LOCAL_PLAN_PREFIX = "guruagent_learning_plan";
  const client = window.supabaseClient || window._supabase || null;
  let userId = "guest";
  let cloudAvailable = false;

  const ready = (async () => {
    if (!client) return;

    try {
      const { data, error } = await client.auth.getSession();
      if (!error && data?.session?.user?.id) {
        userId = data.session.user.id;
        cloudAvailable = true;
      }
    } catch (error) {
      console.warn("Could not identify the learner for cloud plan sync.", error);
    }
  })();

  function localPlanKey() {
    return `${LOCAL_PLAN_PREFIX}:${userId}`;
  }

  function localHistoryKey() {
    return `${HISTORY_KEY}:${userId}`;
  }

  function readLocalPlan() {
    try {
      return JSON.parse(localStorage.getItem(localPlanKey())) || null;
    } catch {
      return null;
    }
  }

  function readHistory() {
    try {
      const scoped = JSON.parse(localStorage.getItem(localHistoryKey()) || "null");
      if (Array.isArray(scoped)) return scoped;

      const legacy = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (!Array.isArray(legacy)) return [];
      if (userId !== "guest" && legacy.length) {
        localStorage.setItem(localHistoryKey(), JSON.stringify(legacy));
        localStorage.removeItem(HISTORY_KEY);
      }
      return legacy;
    } catch {
      return [];
    }
  }

  function inferGoal(text) {
    const value = String(text || "").toLowerCase();
    const subject = /python/.test(value) ? "Python"
      : /\b(dbms|database|sql)\b/.test(value) ? "DBMS"
        : /operating system|\bos\b/.test(value) ? "Operating Systems"
          : /software engineering/.test(value) ? "Software Engineering"
            : /\bhindi\b|हिंदी/.test(value) ? "Hindi"
              : /\benglish\b/.test(value) ? "English"
                : /\bmathematics\b|\bmaths?\b|\balgebra\b/.test(value) ? "Mathematics"
                  : /\bhistory\b/.test(value) ? "History"
                    : /\bgeography\b/.test(value) ? "Geography"
                      : /\bbiology\b/.test(value) ? "Biology"
                        : /\bchemistry\b/.test(value) ? "Chemistry"
                          : /\bphysics\b/.test(value) ? "Physics"
                            : /\b(accounting|accounts)\b/.test(value) ? "Accounting"
                              : /\bjava\b/.test(value) ? "Java"
                                : /\breact\b/.test(value) ? "React"
                                  : /\bjavascript|\bjs\b/.test(value) ? "JavaScript"
                                    : /\bdsa\b|data structures?|algorithms?/.test(value) ? "DSA"
                                      : "General Studies";
    const durationMatch = value.match(/(\d+)\s*(days?|din|weeks?)/);
    const wordWeek = /\b(a|one)\s+week\b|\bweek\b/.test(value);
    const parso = /\bparso\b|day after tomorrow/.test(value);
    const tomorrow = /\btomorrow\b|\bkal\b|\bnext day\b/.test(value);
    const daysUntilExam = durationMatch
      ? Number(durationMatch[1]) * (durationMatch[2].startsWith("week") ? 7 : 1)
      : parso ? 2 : wordWeek ? 7 : tomorrow ? 1 : 7;
    const hoursMatch = value.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/);
    const hindiHoursMatch = value.match(/(?:roz|daily|per day)?\s*(\d+(?:\.\d+)?)\s*(?:ghante?|ghanta)\b/);
    const minutesMatch = value.match(/(\d+)\s*(?:minutes?|mins?|minute|min)\b/);
    const dailyMinutes = hoursMatch || hindiHoursMatch
      ? Math.round(Number((hoursMatch || hindiHoursMatch)[1]) * 60)
      : minutesMatch ? Number(minutesMatch[1]) : 60;

    return {
      subject,
      daysUntilExam: Math.max(1, Math.min(daysUntilExam, 60)),
      dailyMinutes: Math.max(20, Math.min(dailyMinutes, 480)),
      hasDuration: Boolean(durationMatch || wordWeek || parso || tomorrow),
      hasDailyTime: Boolean(hoursMatch || hindiHoursMatch || minutesMatch)
    };
  }

  function inferLanguage(text) {
    const value = String(text || "");
    const isHindi = /[\u0900-\u097f]/.test(value) ||
      /\b(mera|mere|meri|mujhe|mujhse|apna|apni|hain|hai|hoon|hun|hu|parso|kal|roz|padh(?:na|ne|unga|ungi|u|ai|oge)?|sakta|sakti|chahiye|karna|karo|kaise|kya|kitna|kitne|din|ghante?|milega|raha|rahi|liye|ke|mein)\b/i.test(value) ||
      /\b(?:exam|paper|topic|subject)\s+me\b/i.test(value);
    return isHindi ? "hi" : "en";
  }

  function buildPlan(profile) {
    const goalText = [profile.goal, profile.duration, profile.syllabus, profile.weak].filter(Boolean).join(" ");
    const inferred = inferGoal(goalText);
    const subject = profile.subject || inferred.subject;
    const daysUntilExam = Number(profile.daysUntilExam) || inferred.daysUntilExam;
    const dailyInput = String(profile.daily || "");
    const dailyValue = dailyInput.match(/(\d+(?:\.\d+)?)/);
    const dailyMinutes = Number(profile.dailyMinutes) || (dailyValue
      ? Math.round(Number(dailyValue[1]) * (/min/i.test(dailyInput) ? 1 : 60))
      : inferred.dailyMinutes);
    const subjectTopics = {
      Python: [
      ["python-fundamentals", "Python syntax, variables and data types", "Syntax and types"],
      ["python-control-flow", "Conditions, loops and iteration", "Control flow"],
      ["python-collections", "Strings, lists, tuples and dictionaries", "Collections"],
      ["python-functions", "Functions, arguments and built-ins", "Functions"],
      ["python-oop", "Classes, objects and inheritance", "Object-oriented Python"],
      ["python-errors-files", "Exceptions, files and modules", "Exceptions and files"],
      ["python-mock-review", "Timed mixed paper and mistake review", "Mixed revision"]
      ],
      DBMS: [
        ["dbms-fundamentals", "DBMS fundamentals, schemas and data models", "DBMS fundamentals"],
        ["dbms-sql", "SQL queries, joins and aggregate functions", "SQL"],
        ["dbms-keys", "Relational model, keys and constraints", "Database keys"],
        ["dbms-normalization", "Functional dependencies and normalization", "Normalization"],
        ["dbms-transactions", "Transactions, ACID properties and concurrency", "Transactions"],
        ["dbms-design", "ER diagrams and relational design", "ER model"],
        ["dbms-mock-review", "Timed mixed paper and mistake review", "DBMS revision"]
      ],
      "Operating Systems": [
        ["os-fundamentals", "Operating-system services and process states", "Operating systems"],
        ["os-scheduling", "CPU scheduling: FCFS, SJF and Round Robin", "CPU scheduling"],
        ["os-synchronization", "Synchronization, semaphores and critical sections", "Synchronization"],
        ["os-deadlocks", "Deadlocks and the four necessary conditions", "Deadlocks"],
        ["os-memory", "Paging, segmentation and virtual memory", "Memory management"],
        ["os-files", "File systems and disk scheduling", "File systems"],
        ["os-mock-review", "Timed mixed paper and mistake review", "OS revision"]
      ],
      Hindi: [
        ["hindi-prose", "हिंदी गद्य: पाठ का सार और लेखक-परिचय", "गद्य और लेखक-परिचय"],
        ["hindi-poetry", "हिंदी काव्य: भावार्थ, रस और अलंकार", "काव्य और अलंकार"],
        ["hindi-grammar", "हिंदी व्याकरण: संधि, समास और वाक्य-रचना", "हिंदी व्याकरण"],
        ["hindi-writing", "पत्र, निबंध और अपठित गद्यांश का अभ्यास", "लेखन अभ्यास"],
        ["hindi-mock-review", "समयबद्ध प्रश्न-पत्र और गलतियों की समीक्षा", "हिंदी पुनरावृत्ति"]
      ],
      English: [
        ["english-reading", "Reading comprehension and prose review", "Reading comprehension"],
        ["english-literature", "Poetry, themes and literary devices", "Poetry and literary devices"],
        ["english-grammar", "Grammar, sentence structure and editing", "English grammar"],
        ["english-writing", "Essay, letter and formal writing practice", "Writing practice"],
        ["english-mock-review", "Timed question paper and mistake review", "English revision"]
      ],
      "Mathematics": [
        ["maths-concepts", "Core formulas and worked examples", "Mathematics concepts"],
        ["maths-problems", "Step-by-step problem solving", "Mathematics practice"],
        ["maths-weak-area", "Focused practice on difficult question types", "Mathematics revision"],
        ["maths-mock-review", "Timed mixed paper and solution review", "Mathematics mock"]
      ]
    };
    const syllabusTopics = String(profile.syllabus || "")
      .split(/[,;\n]+/)
      .map(topic => topic.trim())
      .filter(Boolean);
    const weakTopics = (Array.isArray(profile.weak) ? profile.weak : String(profile.weak || "").split(/[,;\n]+/))
      .map(topic => String(topic).trim())
      .filter(Boolean);
    const promptLanguage = inferLanguage(profile.prompt || profile.goal || "");
    const englishHindiTopics = [
        ["hindi-prose", "Hindi prose: passage summary and author review", "Prose and author review"],
        ["hindi-poetry", "Hindi poetry: meaning, rasa and poetic devices", "Poetry and poetic devices"],
        ["hindi-grammar", "Hindi grammar: sandhi, samas and sentence structure", "Hindi grammar"],
        ["hindi-writing", "Letters, essays and unseen passage practice", "Hindi writing practice"],
        ["hindi-mock-review", "Timed Hindi paper and mistake review", "Hindi revision"]
    ];
    const curatedTopics = subject === "Hindi" && promptLanguage === "en"
      ? englishHindiTopics
      : subjectTopics[subject] || [
      [`${subject.toLowerCase().replace(/\W+/g, "-")}-fundamentals`, `${subject} core concepts and terminology`, `${subject} fundamentals`],
      [`${subject.toLowerCase().replace(/\W+/g, "-")}-practice`, `${subject} important questions and applied practice`, `${subject} practice`],
      [`${subject.toLowerCase().replace(/\W+/g, "-")}-revision`, `${subject} revision and mock test`, `${subject} revision`]
    ];
    const topics = syllabusTopics.length
      ? syllabusTopics.map((title, index) => [`topic-${index + 1}`, title, title])
      : [...curatedTopics];
    const weakTerms = weakTopics.map(topic => topic.toLocaleLowerCase()).filter(Boolean);
    if (weakTerms.length) {
      weakTerms.forEach((term, index) => {
        if (!topics.some(topic => topic[1].toLocaleLowerCase().includes(term))) {
          const weakTopic = weakTopics[index];
          topics.unshift([`weak-${index + 1}`, weakTopic, weakTopic]);
        }
      });
      topics.sort((left, right) => {
        const score = topic => weakTerms.reduce((total, term) => total + (topic[1].toLocaleLowerCase().includes(term) ? 1 : 0), 0);
        return score(right) - score(left);
      });
    }
    const start = new Date();
    const formatDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const planDays = Array.from({ length: daysUntilExam }, (_, index) => {
      const topic = topics[index % topics.length];
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const learnMinutes = Math.round(dailyMinutes * 0.45);
      const practiceMinutes = Math.round(dailyMinutes * 0.4);
      const revisionMinutes = dailyMinutes - learnMinutes - practiceMinutes;

      return {
        day: index + 1,
        date: formatDate(date),
        title: topic[1],
        topicId: `${topic[0]}-day-${index + 1}`,
        quizTopic: topic[2],
        learnMinutes,
        practiceMinutes,
        revisionMinutes,
        isMock: index === daysUntilExam - 1,
        attempts: 0,
        correct: 0,
        accuracy: 0,
        completed: false
      };
    });
    const examDate = new Date(start);
    examDate.setDate(start.getDate() + daysUntilExam);

    return {
      subject,
      goal: profile.goal || `${subject} exam preparation`,
      profile: {
        name: profile.name || "",
        education: profile.education || "",
        stream: profile.stream || subject,
        year: profile.year || "",
        syllabus: profile.syllabus || "",
        goal: profile.goal || "",
        prompt: profile.prompt || profile.goal || "",
        weak: weakTopics,
        level: profile.level || "",
        daily: profile.daily || "",
        duration: profile.duration || "",
        language: promptLanguage
      },
      examDate: formatDate(examDate),
      daysUntilExam,
      dailyMinutes,
      topics: planDays,
      questions: [],
      createdAt: new Date().toISOString()
    };
  }

  async function loadPlan() {
    await ready;
    const local = readLocalPlan();
    if (!cloudAvailable) return local;

    try {
      const { data, error } = await client
        .from("study_states")
        .select("state")
        .eq("state_key", PLAN_STATE_KEY)
        .maybeSingle();
      if (error) throw error;
      if (data?.state) {
        const localVersion = Date.parse(local?.updatedAt || local?.createdAt || "") || 0;
        const cloudVersion = Date.parse(data.state.updatedAt || data.state.createdAt || "") || 0;
        if (local && localVersion > cloudVersion) {
          const { error: syncError } = await client.from("study_states").upsert({
            user_id: userId,
            state_key: PLAN_STATE_KEY,
            state: local
          }, { onConflict: "user_id,state_key" });
          if (syncError) throw syncError;
          return local;
        }
        localStorage.setItem(localPlanKey(), JSON.stringify(data.state));
        if (Array.isArray(data.state.sessions) && data.state.sessions.length) {
          const merged = new Map();
          [...readHistory(), ...data.state.sessions].forEach(entry => {
            const key = `${entry.savedAt || entry.date}:${entry.subject}:${entry.topicId || ""}:${entry.score || ""}`;
            merged.set(key, entry);
          });
          const history = [...merged.values()]
            .sort((a, b) => new Date(b.savedAt || b.date) - new Date(a.savedAt || a.date))
            .slice(0, 50);
          localStorage.setItem(localHistoryKey(), JSON.stringify(history));
        }
        return data.state;
      }
    } catch (error) {
      console.warn("Could not load the cloud study plan; using this device's saved plan.", error);
    }

    return local;
  }

  async function savePlan(plan) {
    const updated = { ...plan, updatedAt: new Date().toISOString() };
    localStorage.setItem(localPlanKey(), JSON.stringify(updated));
    await ready;
    localStorage.setItem(localPlanKey(), JSON.stringify(updated));
    if (!cloudAvailable) return updated;

    try {
      const { error } = await client.from("study_states").upsert({
        user_id: userId,
        state_key: PLAN_STATE_KEY,
        state: updated
      }, { onConflict: "user_id,state_key" });
      if (error) throw error;
    } catch (error) {
      console.warn("Could not sync the study plan to the cloud.", error);
    }

    return updated;
  }

  async function recordPractice(entry) {
    await ready;
    const history = readHistory();
    const record = userId === "guest" ? entry : { ...entry, userId };
    history.unshift(record);
    localStorage.setItem(localHistoryKey(), JSON.stringify(history.slice(0, 50)));

    const plan = await loadPlan();
    if (!plan) return;
    plan.sessions = (plan.sessions || []).concat(record).slice(-50);

    if (record.topicId) {
      const topic = Array.isArray(plan.topics)
        ? plan.topics.find(item => item.topicId === record.topicId)
        : null;
      if (topic) {
        const questions = Array.isArray(record.questions) ? record.questions : [];
        topic.attempts = Number(topic.attempts || 0) + questions.length;
        topic.correct = Number(topic.correct || 0) + Number(record.correct || 0);
        topic.accuracy = topic.attempts
          ? Math.round(topic.correct * 100 / topic.attempts)
          : 0;
        topic.completed = true;
      }
    }

    await savePlan(plan);
  }

  function getHistory() {
    return readHistory();
  }

  function summarizeHistory(history = readHistory()) {
    const questions = history.reduce((sum, entry) => {
      return sum + (Array.isArray(entry.questions)
        ? entry.questions.length
        : Number(entry.questionCount || entry.questions || 0));
    }, 0);
    const correct = history.reduce((sum, entry) => {
      return sum + (Array.isArray(entry.questions)
        ? entry.questions.filter(question => question.isCorrect).length
        : Number(entry.correct || 0));
    }, 0);
    return {
      sessions: history.length,
      questions,
      correct,
      accuracy: questions ? Math.round(correct * 100 / questions) : 0
    };
  }

  window.GuruLearning = {
    ready,
    buildPlan,
    getHistory,
    inferLanguage,
    inferGoal,
    loadPlan,
    recordPractice,
    savePlan,
    summarizeHistory
  };
})();