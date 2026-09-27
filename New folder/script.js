// ================= SUBJECT SELECTION =================

let selectedSubject = "";
let selectedSubjectName = "";


// ================= DIFFICULTY SELECTION =================

let selectedDifficulty = "";


// ================= SELECT SUBJECT =================

function selectSubject(subject, subjectName) {

    selectedSubject = subject;
    selectedSubjectName = subjectName;

    const selectedSubjectLabel = document.getElementById("selectedSubjectLabel");
    if (selectedSubjectLabel) {
        selectedSubjectLabel.textContent = subjectName;
    }

    document.querySelectorAll(".subject-option").forEach(option => {
        const isSelected = option.dataset.subject === subject;
        option.setAttribute("aria-selected", String(isSelected));
        option.classList.toggle("selected", isSelected);
    });

    closeSubjectOptions();

    // ================= RESET DIFFICULTY =================

    selectedDifficulty = "";


    document.querySelectorAll(".difficulty-tag").forEach(button => {

        button.classList.remove("selected", "easy", "medium", "hard");

    });


    document.getElementById("selectedDifficultyText").textContent =
        "";


    // ================= SHOW DIFFICULTY =================

    const difficultySelection =
        document.getElementById("difficultySelection");

    difficultySelection.style.display = "block";


    // ================= RESET START BUTTON =================

    const startButton =
        document.getElementById("startPracticeBtn");

    const startButtonText =
        document.getElementById("startButtonText");


    startButton.disabled = true;


    startButtonText.textContent =
        "Choose a difficulty to unlock your quiz";

    const quizEntryHint = document.getElementById("quizEntryHint");
    if (quizEntryHint) {
        quizEntryHint.textContent = "Now choose a difficulty to open your quiz.";
    }

}

function closeSubjectOptions() {
    const trigger = document.getElementById("subjectSelect");
    const options = document.getElementById("subjectOptions");

    if (trigger && options) {
        trigger.setAttribute("aria-expanded", "false");
        options.hidden = true;
    }
}

const subjectSelect = document.getElementById("subjectSelect");
const subjectOptions = document.getElementById("subjectOptions");

if (subjectSelect && subjectOptions) {
    subjectSelect.addEventListener("click", () => {
        const isExpanded = subjectSelect.getAttribute("aria-expanded") === "true";
        subjectSelect.setAttribute("aria-expanded", String(!isExpanded));
        subjectOptions.hidden = isExpanded;
    });

    subjectOptions.addEventListener("click", event => {
        const option = event.target.closest(".subject-option");
        if (!option) {
            return;
        }

        selectSubject(option.dataset.subject, option.dataset.subjectName);
        subjectSelect.focus();
    });

    subjectSelect.addEventListener("keydown", event => {
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            subjectSelect.setAttribute("aria-expanded", "true");
            subjectOptions.hidden = false;
            subjectOptions.querySelector(".subject-option")?.focus();
        }
    });

    subjectOptions.addEventListener("keydown", event => {
        const options = [...subjectOptions.querySelectorAll(".subject-option")];
        const currentIndex = options.indexOf(document.activeElement);

        if (event.key === "Escape") {
            closeSubjectOptions();
            subjectSelect.focus();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? 1 : -1;
            const nextIndex = (currentIndex + direction + options.length) % options.length;
            options[nextIndex].focus();
        } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            options[event.key === "Home" ? 0 : options.length - 1].focus();
        } else if (event.key === "Tab") {
            closeSubjectOptions();
        }
    });

    document.addEventListener("click", event => {
        if (!event.target.closest(".subject-select-wrapper")) {
            closeSubjectOptions();
        }
    });
}


// ================= SELECT DIFFICULTY =================

function selectDifficulty(difficulty, button) {

    selectedDifficulty = difficulty;


    // Remove selected class

    document.querySelectorAll(".difficulty-tag").forEach(button => {

        button.classList.remove("selected", "easy", "medium", "hard");

    });


    // Add selected class and difficulty class
    button.classList.add("selected", difficulty);


    // Difficulty name

    let difficultyName = "";


    if (difficulty === "easy") {

        difficultyName = "Easy";

    }

    else if (difficulty === "medium") {

        difficultyName = "Medium";

    }

    else if (difficulty === "hard") {

        difficultyName = "Hard";

    }


    // Update difficulty text

    const difficultyText =
        document.getElementById("selectedDifficultyText");


    difficultyText.textContent =
        `${difficultyName} level selected • 5 questions`;


    // Enable Start button

    const startButton =
        document.getElementById("startPracticeBtn");


    const startButtonText =
        document.getElementById("startButtonText");


    startButton.disabled = false;


    startButtonText.textContent =
        `Start ${selectedSubjectName} Quiz`;

    const quizEntryHint = document.getElementById("quizEntryHint");
    if (quizEntryHint) {
        quizEntryHint.textContent = `Opening your ${difficultyName} ${selectedSubjectName} quiz…`;
    }

    startSelectedPractice();

}



// ================= START SELECTED PRACTICE =================

function startSelectedPractice() {

    // Subject + difficulty required

    if (!selectedSubject || !selectedDifficulty) {

        return;

    }


    // Send subject + difficulty to quiz page

    window.location.href =
        `quiz.html?subject=${selectedSubject}&difficulty=${selectedDifficulty}`;

}


// ================= OVERVIEW STATS =================

function getPracticeHistory() {

    try {

        return JSON.parse(
            localStorage.getItem("practiceHistory")
        ) || [];

    } catch (error) {

        return [];

    }

}

function getCurrentStreakDates(history) {

    if (!history || history.length === 0) {
        return [];
    }

    const sessionsByDate = new Map();

    history.forEach(entry => {
        const date = new Date(entry.savedAt || entry.date);

        if (Number.isNaN(date.getTime())) {
            return;
        }

        const dayNumber = Math.floor(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        ) / (1000 * 60 * 60 * 24));

        if (!sessionsByDate.has(dayNumber)) {
            sessionsByDate.set(dayNumber, {
                dayNumber,
                date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                sessions: 0
            });
        }

        sessionsByDate.get(dayNumber).sessions++;
    });

    const uniqueDates = [...sessionsByDate.values()]
        .sort((a, b) => b.dayNumber - a.dayNumber);

    if (uniqueDates.length === 0) {
        return [];
    }

    const today = new Date();
    const todayNumber = Math.floor(Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    ) / (1000 * 60 * 60 * 24));
    const daysSinceLatest = todayNumber - uniqueDates[0].dayNumber;

    if (daysSinceLatest > 1) {
        return [];
    }

    const streakDates = [uniqueDates[0]];

    for (let i = 1; i < uniqueDates.length; i++) {
        const previousDate = uniqueDates[i];
        const diffDays = streakDates[streakDates.length - 1].dayNumber - previousDate.dayNumber;

        if (diffDays === 1) {
            streakDates.push(previousDate);
        } else {
            break;
        }
    }

    return streakDates;

}

function getCurrentStreak(history) {

    return getCurrentStreakDates(history).length;

}

function getWeakTopic(history) {

    const topicStats = new Map();
    const latestTopicStats = new Map();

    history.forEach((session, sessionIndex) => {
        (Array.isArray(session.questions) ? session.questions : []).forEach(question => {
            if (!question.topic) {
                return;
            }

            const key = `${session.subject || "Practice"}::${question.topic}`;
            const maps = sessionIndex === 0
                ? [topicStats, latestTopicStats]
                : [topicStats];

            maps.forEach(statsMap => {
                const stats = statsMap.get(key) || {
                    subject: session.subject || "Practice",
                    topic: question.topic,
                    correct: 0,
                    wrong: 0
                };

                if (question.isCorrect) {
                    stats.correct++;
                } else {
                    stats.wrong++;
                }

                statsMap.set(key, stats);
            });
        });
    });

    const latestHasTopicResults = latestTopicStats.size > 0;
    const candidates = latestHasTopicResults
        ? [...latestTopicStats.values()]
        : [...topicStats.values()];

    return candidates
        .filter(stats => stats.wrong > 0)
        .sort((a, b) => {
            const accuracyDifference =
                (a.correct / (a.correct + a.wrong)) -
                (b.correct / (b.correct + b.wrong));

            return accuracyDifference || b.wrong - a.wrong;
        })[0] || null;

}

function renderCurrentStreak() {

    const streakDates = getCurrentStreakDates(getPracticeHistory());
    const list = document.getElementById("currentStreakList");

    if (!list) {
        return;
    }

    list.replaceChildren();

    if (streakDates.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "practice-history-item";
        emptyMessage.textContent = "No active streak yet. Practice today to start one.";
        list.appendChild(emptyMessage);
        return;
    }

    streakDates.forEach((streakDay, index) => {
        const item = document.createElement("article");
        item.className = "practice-history-item";

        const heading = document.createElement("div");
        heading.className = "practice-history-top";

        const day = document.createElement("strong");
        day.textContent = `Day ${index + 1}`;

        const date = document.createElement("small");
        date.textContent = streakDay.date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });

        const sessions = document.createElement("small");
        sessions.textContent = `${streakDay.sessions} practice session${streakDay.sessions === 1 ? "" : "s"}`;

        heading.append(day, date);
        item.append(heading, sessions);
        list.appendChild(item);
    });

}

function getAiFocusMessage(history) {

    if (!history || history.length === 0) {
        return "Start practicing to unlock AI insights.";
    }

    const latest = history[0];
    const latestSubject = latest.subject || "your recent practice";
    const latestAccuracy = Number(latest.accuracy || 0);
    const weakTopic = getWeakTopic(history);
    const latestQuestions = Array.isArray(history[0].questions)
        ? history[0].questions
        : [];
    const latestQuizAllCorrect = latestQuestions.length > 0 &&
        latestQuestions.every(question => question.topic && question.isCorrect);

    if (latestQuizAllCorrect) {
        return `Excellent work! You answered every ${latest.subject || "practice"} question correctly, so no weak topic showed up in your latest quiz. Keep practicing to maintain your accuracy.`;
    }

    const recentSessions = history.slice(0, 3);
    const averageAccuracy = recentSessions.length > 0
        ? Math.round(
            recentSessions.reduce(
                (sum, session) => sum + Number(session.accuracy || 0),
                0
            ) / recentSessions.length
        )
        : 0;

    const subjectStats = {};

    history.forEach(entry => {
        const name = entry.subject || "General";

        if (!subjectStats[name]) {
            subjectStats[name] = {
                total: 0,
                count: 0
            };
        }

        subjectStats[name].total += Number(entry.accuracy || 0);
        subjectStats[name].count += 1;
    });

    const weakestSubject = Object.entries(subjectStats)
        .map(([subject, stats]) => ({
            subject,
            average: Math.round(stats.total / stats.count)
        }))
        .sort((a, b) => a.average - b.average)[0];

    const subjectTopics = {
        "Python Programming": ["Functions", "OOP", "Loops", "Error Handling"],
        "Operating Systems": ["Scheduling", "Deadlocks", "Memory Management", "CPU Concepts"],
        "DBMS": ["SQL Queries", "Keys", "Normalization", "Joins"],
        "Software Engineering": ["SDLC", "Testing", "Agile", "Requirements"],
        "Emerging Technologies": ["AI Basics", "NLP", "Cloud", "Computer Vision"],
        "Internet & Web Technology": ["HTML", "CSS", "JavaScript", "Web Security"]
    };

    const subjectName = weakestSubject ? weakestSubject.subject : latestSubject;
    const weakTopics = subjectTopics[subjectName] || ["Core Concepts", "Practice Revisions"];
    const focusTopics = weakTopics.slice(0, 2).join(" and ");

    let recommendation = `Your last 3 sessions average ${averageAccuracy}% accuracy.`;

    if (weakTopic) {
        const attempted = weakTopic.correct + weakTopic.wrong;
        recommendation += ` Your answers show ${weakTopic.topic} is a weak area in ${weakTopic.subject}: ${weakTopic.wrong} of ${attempted} question${attempted === 1 ? "" : "s"} missed. Review this topic before your next practice.`;
        return recommendation;
    }

    if (weakestSubject) {
        recommendation += ` ${subjectName} is your weakest subject right now with ${weakestSubject.average}% average.`;
    } else {
        recommendation += ` ${latestSubject} is your latest focus area.`;
    }

    if (latestAccuracy < 50) {
        recommendation += ` Based on your latest ${latestSubject} result (${latestAccuracy}%), revise ${focusTopics} before your next Hard session.`;
    } else if (latestAccuracy < 70) {
        recommendation += ` Your recent practice is improving. Focus on ${focusTopics} to build better accuracy.`;
    } else {
        recommendation += ` Your trend is strong. Keep improving and revise ${focusTopics} to stay consistent.`;
    }

    return recommendation;

}

function getSubjectPerformance(history) {

    const subjectStats = {};

    history.forEach(entry => {
        const subject = entry.subject || "General";
        const correct = Number(entry.correct || 0);
        const wrong = Number(entry.wrong || 0);

        if (!subjectStats[subject]) {
            subjectStats[subject] = {
                correct: 0,
                attempted: 0,
                accuracyTotal: 0,
                sessions: 0
            };
        }

        subjectStats[subject].correct += correct;
        subjectStats[subject].attempted += correct + wrong;
        subjectStats[subject].accuracyTotal += Number(entry.accuracy || 0);
        subjectStats[subject].sessions++;
    });

    return Object.entries(subjectStats)
        .map(([subject, stats]) => ({
            subject,
            sessions: stats.sessions,
            accuracy: stats.attempted > 0
                ? Math.round((stats.correct / stats.attempted) * 100)
                : Math.round(stats.accuracyTotal / stats.sessions)
        }))
        .sort((a, b) => a.accuracy - b.accuracy);

}

function renderAiFocusDetails(history) {

    const panel = document.getElementById("aiFocusDetails");
    const performanceList = document.getElementById("aiSubjectPerformance");
    const improvementMessage = document.getElementById("aiImprovementMessage");

    if (!panel || !performanceList || !improvementMessage) {
        return;
    }

    performanceList.replaceChildren();

    const subjectPerformance = getSubjectPerformance(history);

    if (subjectPerformance.length === 0) {
        improvementMessage.textContent = "Complete a practice session to see your weak subjects and improvement suggestions here.";
        return;
    }

    subjectPerformance.forEach(result => {
        const row = document.createElement("div");
        row.className = "ai-subject-row";

        const subject = document.createElement("strong");
        subject.textContent = result.subject;

        const score = document.createElement("small");
        score.textContent = `${result.accuracy}% · ${result.sessions} session${result.sessions === 1 ? "" : "s"}`;

        const meter = document.createElement("div");
        meter.className = "ai-subject-meter";
        meter.setAttribute("role", "meter");
        meter.setAttribute("aria-label", `${result.subject} accuracy`);
        meter.setAttribute("aria-valuemin", "0");
        meter.setAttribute("aria-valuemax", "100");
        meter.setAttribute("aria-valuenow", String(result.accuracy));

        const fill = document.createElement("span");
        fill.style.width = `${Math.max(0, Math.min(100, result.accuracy))}%`;
        meter.appendChild(fill);

        row.append(subject, score, meter);
        performanceList.appendChild(row);
    });

    const weakest = subjectPerformance[0];
    const weakTopic = getWeakTopic(history);
    const latestQuestions = Array.isArray(history[0].questions)
        ? history[0].questions
        : [];

    if (latestQuestions.length > 0 &&
        latestQuestions.every(question => question.topic && question.isCorrect)) {
        improvementMessage.textContent = `Excellent work! You answered every ${history[0].subject || "practice"} question correctly. No weak topic showed up in your latest quiz.`;
        return;
    }

    const subjectTopics = {
        "Python Programming": "Functions, OOP, loops, and error handling",
        "Operating Systems": "Scheduling, deadlocks, and memory management",
        "DBMS": "SQL queries, keys, normalization, and joins",
        "Software Engineering": "SDLC, testing, Agile, and requirements",
        "Emerging Technologies": "AI basics, NLP, cloud, and computer vision",
        "Internet & Web Technology": "HTML, CSS, JavaScript, and web security"
    };
    if (weakTopic) {
        const attempted = weakTopic.correct + weakTopic.wrong;
        improvementMessage.textContent = `Your answers show ${weakTopic.topic} is a weak area in ${weakTopic.subject}: you missed ${weakTopic.wrong} of ${attempted} question${attempted === 1 ? "" : "s"}. Review this topic and the incorrect answers above.`;
        return;
    }

    const topics = subjectTopics[weakest.subject] || "core concepts and practice revisions";
    improvementMessage.textContent = `Your lowest-scoring subject is ${weakest.subject} at ${weakest.accuracy}% accuracy. Keep practicing ${topics} to strengthen your overall performance.`;

}

function renderPracticeHistory() {

    const history = getPracticeHistory();
    const panel = document.getElementById("practiceHistoryPanel");
    const list = document.getElementById("practiceHistoryList");

    if (!panel || !list) {
        return;
    }

    if (!history.length) {
        list.innerHTML = "<div class=\"practice-history-item\"><p>No practice history yet.</p></div>";
        return;
    }

    list.innerHTML = history.map((entry, index) => {
        const subject = entry.subject || "Practice";
        const score = entry.score || "0/5";
        const accuracy = entry.accuracy ?? 0;
        const date = entry.date || "Today";

        return `
            <div class="practice-history-item">
                <div class="practice-history-top">
                    <strong>${index + 1}. ${subject}</strong>
                    <small>${score}</small>
                </div>
                <small>Accuracy: ${accuracy}%</small>
                <p>${date}</p>
            </div>
        `;
    }).join("");

}

function togglePracticeHistory() {

    const panel = document.getElementById("practiceHistoryPanel");
    const solvedQuestionsPanel = document.getElementById("solvedQuestionsPanel");
    const accuracyHistoryPanel = document.getElementById("accuracyHistoryPanel");
    const currentStreakPanel = document.getElementById("currentStreakPanel");

    if (!panel) {
        return;
    }

    const shouldOpen = panel.hidden;
    panel.hidden = !shouldOpen;

    if (shouldOpen) {
        if (solvedQuestionsPanel) {
            solvedQuestionsPanel.hidden = true;
        }
        if (accuracyHistoryPanel) {
            accuracyHistoryPanel.hidden = true;
        }
        if (currentStreakPanel) {
            currentStreakPanel.hidden = true;
        }
        renderPracticeHistory();
    }

}

const legacyQuestionBank = {
    "Python Programming": [
        "Which keyword is used to define a function in Python?",
        "Which data type is immutable in Python?",
        "Which symbol is used for comments in Python?",
        "What is the output type of input() in Python?",
        "Which function is used to find the length of a list?"
    ],
    "Operating Systems": [
        "Which of the following is a process state?",
        "Which algorithm is used for deadlock avoidance?",
        "Which scheduling algorithm uses a time quantum?",
        "What does CPU stand for?",
        "Which condition is necessary for deadlock?"
    ],
    "DBMS": [
        "What does DBMS stand for?",
        "Which language is commonly used to query databases?",
        "Which key uniquely identifies a record?",
        "Which command is used to retrieve data?",
        "Which normal form removes partial dependency?"
    ],
    "Software Engineering": [
        "What does SDLC stand for?",
        "Which model follows a sequential approach?",
        "Which testing tests individual components?",
        "What does UI stand for?",
        "Which metric measures software complexity?"
    ],
    "Emerging Technologies": [
        "What does AI stand for?",
        "Which field deals with understanding human language?",
        "Which technology is associated with distributed data processing?",
        "Computer Vision mainly deals with:",
        "PyTorch is mainly used for:"
    ],
    "Internet & Web Technology": [
        "What does HTML stand for?",
        "Which language is used for styling web pages?",
        "Which language is mainly used to add interactivity to web pages?",
        "Which tag is used to create a hyperlink?",
        "Which protocol is commonly used for web communication?"
    ]
};

function renderSolvedQuestions() {

    const history = getPracticeHistory();
    const list = document.getElementById("solvedQuestionsList");

    if (!list) {
        return;
    }

    list.replaceChildren();

    if (history.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "practice-history-item";
        emptyMessage.textContent = "Complete a practice session to see your solved questions here.";
        list.appendChild(emptyMessage);
        return;
    }

    history.forEach((session, sessionIndex) => {
        const sessionSection = document.createElement("section");
        sessionSection.className = "solved-session";

        const heading = document.createElement("div");
        heading.className = "solved-session-heading";

        const subject = document.createElement("strong");
        subject.textContent = `${sessionIndex + 1}. ${session.subject || "Practice"} · ${session.score || ""}`;

        const date = document.createElement("small");
        date.textContent = session.date || "Date unavailable";

        heading.append(subject, date);
        sessionSection.appendChild(heading);

        const savedQuestions = Array.isArray(session.questions) ? session.questions : [];
        const questionResults = savedQuestions.length > 0
            ? savedQuestions
            : (legacyQuestionBank[session.subject] || []).map(question => ({
                question,
                legacyPrompt: true
            }));

        if (questionResults.length === 0) {
            const olderSessionNote = document.createElement("small");
            olderSessionNote.textContent = "Question prompts are unavailable for this session.";
            sessionSection.appendChild(olderSessionNote);
        } else {
            questionResults.forEach((result, questionIndex) => {
                const questionItem = document.createElement("article");
                questionItem.className = result.legacyPrompt
                    ? "solved-question"
                    : `solved-question ${result.isCorrect ? "correct" : "wrong"}`;

                const question = document.createElement("p");
                question.textContent = `Q${questionIndex + 1}. ${result.question}`;

                questionItem.appendChild(question);

                if (result.legacyPrompt) {
                    const answerNote = document.createElement("small");
                    answerNote.textContent = "Your answer was not saved for this older session.";
                    questionItem.appendChild(answerNote);
                } else {
                    const answerStatus = document.createElement("small");
                    answerStatus.textContent = `${result.isCorrect ? "Correct" : "Incorrect"} · Your answer: ${result.userAnswer}`;

                    const correctAnswer = document.createElement("small");
                    correctAnswer.textContent = `Correct answer: ${result.correctAnswer}`;

                    questionItem.append(answerStatus, correctAnswer);
                }

                sessionSection.appendChild(questionItem);
            });
        }

        list.appendChild(sessionSection);
    });

}

function toggleSolvedQuestions() {

    const panel = document.getElementById("solvedQuestionsPanel");
    const practiceHistoryPanel = document.getElementById("practiceHistoryPanel");
    const accuracyHistoryPanel = document.getElementById("accuracyHistoryPanel");
    const currentStreakPanel = document.getElementById("currentStreakPanel");

    if (!panel) {
        return;
    }

    const shouldOpen = panel.hidden;
    panel.hidden = !shouldOpen;

    if (shouldOpen) {
        if (practiceHistoryPanel) {
            practiceHistoryPanel.hidden = true;
        }
        if (accuracyHistoryPanel) {
            accuracyHistoryPanel.hidden = true;
        }
        if (currentStreakPanel) {
            currentStreakPanel.hidden = true;
        }
        renderSolvedQuestions();
    }

}

function renderAccuracyHistory() {

    const history = getPracticeHistory();
    const list = document.getElementById("accuracyHistoryList");

    if (!list) {
        return;
    }

    list.replaceChildren();

    if (history.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "practice-history-item";
        emptyMessage.textContent = "Complete a practice session to see its accuracy here.";
        list.appendChild(emptyMessage);
        return;
    }

    history.forEach((session, index) => {
        const correct = Number(session.correct || 0);
        const wrong = Number(session.wrong || 0);
        const attempted = correct + wrong;
        const accuracy = attempted > 0
            ? Math.round((correct / attempted) * 100)
            : Number(session.accuracy || 0);

        const item = document.createElement("article");
        item.className = "practice-history-item";

        const heading = document.createElement("div");
        heading.className = "practice-history-top";

        const subject = document.createElement("strong");
        subject.textContent = `${index + 1}. ${session.subject || "Practice"}`;

        const result = document.createElement("small");
        result.textContent = `${accuracy}%`;

        const details = document.createElement("small");
        details.textContent = `${correct}/${attempted} correct · ${wrong} incorrect`;

        const date = document.createElement("p");
        date.textContent = session.date || "Date unavailable";

        heading.append(subject, result);
        item.append(heading, details, date);
        list.appendChild(item);
    });

}

function toggleAccuracyHistory() {

    const panel = document.getElementById("accuracyHistoryPanel");
    const practiceHistoryPanel = document.getElementById("practiceHistoryPanel");
    const solvedQuestionsPanel = document.getElementById("solvedQuestionsPanel");
    const currentStreakPanel = document.getElementById("currentStreakPanel");

    if (!panel) {
        return;
    }

    const shouldOpen = panel.hidden;
    panel.hidden = !shouldOpen;

    if (shouldOpen) {
        if (practiceHistoryPanel) {
            practiceHistoryPanel.hidden = true;
        }
        if (solvedQuestionsPanel) {
            solvedQuestionsPanel.hidden = true;
        }
        if (currentStreakPanel) {
            currentStreakPanel.hidden = true;
        }
        renderAccuracyHistory();
    }

}

function toggleCurrentStreak() {

    const panel = document.getElementById("currentStreakPanel");
    const practiceHistoryPanel = document.getElementById("practiceHistoryPanel");
    const solvedQuestionsPanel = document.getElementById("solvedQuestionsPanel");
    const accuracyHistoryPanel = document.getElementById("accuracyHistoryPanel");

    if (!panel) {
        return;
    }

    const shouldOpen = panel.hidden;
    panel.hidden = !shouldOpen;

    if (shouldOpen) {
        [practiceHistoryPanel, solvedQuestionsPanel, accuracyHistoryPanel].forEach(otherPanel => {
            if (otherPanel) {
                otherPanel.hidden = true;
            }
        });
        renderCurrentStreak();
    }

}

function renderRecentPracticeHistory() {

    const rows = document.getElementById("recentPracticeRows");

    if (!rows) {
        return;
    }

    const history = getPracticeHistory();
    rows.replaceChildren();

    if (history.length === 0) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        emptyCell.colSpan = 5;
        emptyCell.className = "history-empty";
        emptyCell.textContent = "No practice history yet.";
        emptyRow.appendChild(emptyCell);
        rows.appendChild(emptyRow);
        return;
    }

    history.slice(0, 5).forEach(entry => {
        const row = document.createElement("tr");
        const date = new Date(entry.savedAt || entry.date);
        const questionCount = Array.isArray(entry.questions)
            ? entry.questions.length
            : Number(entry.correct || 0) + Number(entry.wrong || 0);
        const cells = [
            entry.subject || "Practice",
            Number.isNaN(date.getTime())
                ? (entry.date || "Date unavailable")
                : date.toLocaleDateString(),
            questionCount > 0 ? `${questionCount} Questions` : "—",
            entry.accuracy !== undefined && entry.accuracy !== null
                ? `${Number(entry.accuracy)}%`
                : (entry.score || "—"),
            entry.timeSpent || entry.duration || "—"
        ];

        cells.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = String(value);
            row.appendChild(cell);
        });

        rows.appendChild(row);
    });

}

function updateOverviewStats() {

    const history = getPracticeHistory();

    const today = new Date();
    const todayQuestions = history.reduce((sum, entry) => {
        const date = new Date(entry.savedAt || entry.date);
        const isToday = !Number.isNaN(date.getTime()) &&
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

        if (!isToday) {
            return sum;
        }

        const questionCount = Array.isArray(entry.questions)
            ? entry.questions.length
            : Number(entry.correct || 0) + Number(entry.wrong || 0);
        return sum + questionCount;
    }, 0);
    const totalQuestions = history.reduce(
        (sum, entry) => sum + (Array.isArray(entry.questions)
            ? entry.questions.length
            : Number(entry.correct || 0) + Number(entry.wrong || 0)),
        0
    );
    const totalCorrect = history.reduce(
        (sum, entry) => sum + (Array.isArray(entry.questions)
            ? entry.questions.filter(question => question.isCorrect).length
            : Number(entry.correct || 0)),
        0
    );
    const accuracy = totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;
    const streak = getCurrentStreak(history);

    const totalPracticeValue = document.getElementById("totalPracticeValue");
    const questionsSolvedValue = document.getElementById("questionsSolvedValue");
    const accuracyValue = document.getElementById("accuracyValue");
    const streakValue = document.getElementById("streakValue");
    const aiFocusMessage = document.getElementById("aiFocusMessage");
    const weakAreaValue = document.getElementById("weakAreaValue");
    const aiFocusTopic = document.getElementById("aiFocusTopic");
    const aiCurrentAccuracy = document.getElementById("aiCurrentAccuracy");
    const featuredAccuracy = document.getElementById("featuredAccuracy");
    const aiAccuracyProgress = document.getElementById("aiAccuracyProgress");
    const operatingSystems = getSubjectPerformance(history)
        .find(result => result.subject === "Operating Systems");
    const focusAccuracy = operatingSystems ? operatingSystems.accuracy : 42;
    const weakTopic = getWeakTopic(history);
    const weakArea = weakTopic?.topic || "Process Scheduling";

    if (totalPracticeValue) {
        totalPracticeValue.textContent = `${todayQuestions} / 30`;
    }

    if (questionsSolvedValue) {
        questionsSolvedValue.textContent = totalQuestions;
    }

    if (accuracyValue) {
        accuracyValue.textContent = `${accuracy}%`;
    }

    if (streakValue) {
        streakValue.textContent = `${streak} Day${streak === 1 ? "" : "s"}`;
    }

    if (aiFocusMessage) {
        aiFocusMessage.textContent = getAiFocusMessage(history);
    }

    if (weakAreaValue) {
        weakAreaValue.textContent = weakArea;
    }

    if (aiFocusTopic) {
        aiFocusTopic.textContent = weakArea;
    }

    if (aiCurrentAccuracy) {
        aiCurrentAccuracy.textContent = `${focusAccuracy}%`;
    }

    if (featuredAccuracy) {
        featuredAccuracy.textContent = `${focusAccuracy}%`;
    }

    if (aiAccuracyProgress) {
        aiAccuracyProgress.style.width = `${Math.max(0, Math.min(100, focusAccuracy))}%`;
        aiAccuracyProgress.parentElement.setAttribute("aria-valuenow", String(focusAccuracy));
    }

    renderPracticeHistory();
    renderRecentPracticeHistory();

}

function refreshOverviewFromStorage() {

    updateOverviewStats();

    const headerDate = document.getElementById("headerDate");
    if (headerDate) {
        headerDate.textContent = new Date().toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

}

window.addEventListener("DOMContentLoaded", refreshOverviewFromStorage);
window.addEventListener("pageshow", refreshOverviewFromStorage);
window.addEventListener("storage", refreshOverviewFromStorage);

const totalPracticeCard = document.getElementById("totalPracticeCard");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const questionsSolvedCard = document.getElementById("questionsSolvedCard");
const closeSolvedQuestionsBtn = document.getElementById("closeSolvedQuestionsBtn");
const accuracyCard = document.getElementById("accuracyCard");
const closeAccuracyHistoryBtn = document.getElementById("closeAccuracyHistoryBtn");
const currentStreakCard = document.getElementById("currentStreakCard");
const closeCurrentStreakBtn = document.getElementById("closeCurrentStreakBtn");
const aiFocusToggle = document.getElementById("aiFocusToggle");
const aiFocusDetails = document.getElementById("aiFocusDetails");

if (totalPracticeCard) {
    totalPracticeCard.addEventListener("click", togglePracticeHistory);
    totalPracticeCard.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            togglePracticeHistory();
        }
    });
}

if (questionsSolvedCard) {
    questionsSolvedCard.addEventListener("click", toggleSolvedQuestions);
    questionsSolvedCard.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleSolvedQuestions();
        }
    });
}

if (accuracyCard) {
    accuracyCard.addEventListener("click", toggleAccuracyHistory);
    accuracyCard.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleAccuracyHistory();
        }
    });
}

if (currentStreakCard) {
    currentStreakCard.addEventListener("click", toggleCurrentStreak);
    currentStreakCard.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleCurrentStreak();
        }
    });
}

if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener("click", () => {
        const panel = document.getElementById("practiceHistoryPanel");
        if (panel) {
            panel.hidden = true;
        }
    });
}

if (closeSolvedQuestionsBtn) {
    closeSolvedQuestionsBtn.addEventListener("click", () => {
        const panel = document.getElementById("solvedQuestionsPanel");
        if (panel) {
            panel.hidden = true;
        }
    });
}

if (closeAccuracyHistoryBtn) {
    closeAccuracyHistoryBtn.addEventListener("click", () => {
        const panel = document.getElementById("accuracyHistoryPanel");
        if (panel) {
            panel.hidden = true;
        }
    });
}

if (closeCurrentStreakBtn) {
    closeCurrentStreakBtn.addEventListener("click", () => {
        const panel = document.getElementById("currentStreakPanel");
        if (panel) {
            panel.hidden = true;
        }
    });
}

if (aiFocusToggle && aiFocusDetails) {
    aiFocusToggle.addEventListener("click", () => {
        const isExpanded = aiFocusToggle.getAttribute("aria-expanded") === "true";
        aiFocusToggle.setAttribute("aria-expanded", String(!isExpanded));
        aiFocusToggle.textContent = isExpanded ? "View weak areas" : "Hide weak areas";
        aiFocusDetails.hidden = isExpanded;
        renderAiFocusDetails(getPracticeHistory());
    });
}

refreshOverviewFromStorage();