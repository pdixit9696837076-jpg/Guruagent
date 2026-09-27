const STORAGE_KEY = "chanakya-marg-dashboard";
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = dayNames[new Date().getDay()];
let subjects = ["DBMS", "OOP", "OS", "JavaScript", "React"];
let plans = {
  Monday: [["08:00 - 08:35", "DBMS", "Normalization and functional dependencies"], ["10:00 - 10:40", "OS", "Process scheduling fundamentals"], ["16:00 - 16:35", "JavaScript", "Arrays, objects and callbacks"], ["20:00 - 20:25", "Recall", "Closed-book review"]],
  Tuesday: [["08:00 - 08:35", "OOP", "Classes, inheritance and composition"], ["10:00 - 10:40", "DBMS", "Normalization practice"], ["16:00 - 16:35", "OS", "FCFS, SJF and Round Robin"], ["20:00 - 20:25", "Recall", "Explain the hardest answer"]],
  Wednesday: [["08:00 - 08:35", "JavaScript", "Promises and async"], ["10:00 - 10:40", "React", "Components, props and state"], ["16:00 - 16:35", "DBMS", "Transactions and ACID"], ["20:00 - 20:25", "Recall", "Review connected concepts"]],
  Thursday: [["08:00 - 08:35", "OS", "Deadlocks and synchronization"], ["10:00 - 10:40", "OOP", "Interfaces and collections"], ["16:00 - 16:35", "JavaScript", "DOM events and debugging"], ["20:00 - 20:25", "Recall", "Flash review of weak areas"]],
  Friday: [["08:00 - 08:45", "Mixed Test", "DBMS, OOP and OS"], ["10:00 - 10:35", "JavaScript", "Frontend coding practice"], ["16:00 - 16:35", "React", "Render flow and state"], ["20:00 - 20:25", "Recall", "Three lessons from the test"]],
  Saturday: [["09:00 - 09:45", "Weekly Test", "All five subjects"], ["11:00 - 11:35", "Review", "Analyse incorrect answers"], ["16:00 - 16:35", "Weak Area", "Target the lowest score"], ["20:00 - 20:25", "Recall", "Summarise the week"]],
  Sunday: [["09:00 - 09:45", "Weekly Test", "25-question mixed test"], ["11:30 - 12:05", "Review", "Mark incorrect answer patterns"], ["16:00 - 16:35", "Revision", "Revisit frequent mistakes"], ["20:00 - 20:25", "Plan", "Set next week's first block"]]
};
const copy = {
  Monday: "Build strong concepts today - one focused block at a time.", Tuesday: "Turn yesterday's concepts into working problem-solving skill.", Wednesday: "Connect ideas across subjects.", Thursday: "Reinforce weak areas with deliberate practice.", Friday: "Close the study week with exam-style questions.", Saturday: "Test what you learned this week.", Sunday: "Measure readiness with a full-week mock."
};
let selectedSubject = null;
let weekDays = dayNames.slice(1);
let weekDay = weekDays.includes(today) ? today : "Monday";
let activeDay = today;
let adaptivePlan = null;
let state = loadState();

function loadState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { completed: {} }; } catch { return { completed: {} }; } }
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function el(id) { return document.getElementById(id); }
function text(id, value) { if (el(id)) el(id).textContent = value; }
function escapeHTML(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function minutes(range) { const values = range.split(" - ").map(v => v.split(":").map(Number)); return values[1][0] * 60 + values[1][1] - values[0][0] * 60 - values[0][1]; }
function hours(value) { return `${(value / 60).toFixed(1)} hrs`; }
function topicForDay(day) { const index = weekDays.indexOf(day); return index >= 0 ? adaptivePlan?.topics?.[index] : null; }
function sessionKey(day, index) {
  const topic = topicForDay(day);
  return topic ? `plan:${topic.topicId}:${index}` : `${day}:${selectedSubject || "all"}:${index}`;
}
function isSessionComplete(day, item, index) {
  const topic = topicForDay(day);
  return Boolean(state.completed[sessionKey(day, index)] || (topic?.completed && item[4] === "practice"));
}
function isPlanSessionComplete(topic, index, stage) {
  return Boolean(state.completed[`plan:${topic.topicId}:${index}`] || (topic.completed && stage === "practice"));
}

function render() {
  const all = plans[activeDay] || plans[weekDays[0]] || [];
  const sessions = selectedSubject ? all.filter(item => item[1] === selectedSubject || ["Practice", "Revision", "Recall", "Plan"].includes(item[1])) : all;
  const total = sessions.reduce((sum, item) => sum + minutes(item[0]), 0);
  const complete = sessions.length > 0 && sessions.every((item, index) => isSessionComplete(activeDay, item, index));
  text("todayLabel", activeDay === today ? "Today" : activeDay); text("dayKicker", activeDay.toUpperCase()); text("dayHeading", `${activeDay}'s Complete Plan`); text("bigDay", activeDay);
  text("bigDaySub", adaptivePlan ? `Day ${weekDays.indexOf(activeDay) + 1} · ${topicForDay(activeDay)?.title || adaptivePlan.subject}` : copy[activeDay]); text("planLoad", `${sessions.length} sessions`); text("planMinutes", `${total} min`); text("agentNote", adaptivePlan ? `Focus on ${topicForDay(activeDay)?.title || adaptivePlan.subject}, then use the final block for recall.` : "Use the first block for concepts and the final block for recall practice.");
  text("todayTarget", adaptivePlan ? `Finish today's blocks and keep time for a final recall review before your exam.` : "Complete at least 70% of planned minutes."); text("noticeTitle", selectedSubject ? `${selectedSubject} focus` : `${activeDay}'s focus`); text("noticeText", adaptivePlan ? `Your ${adaptivePlan.subject} study plan is based on your goal and exam deadline.` : selectedSubject ? `Showing ${selectedSubject} blocks for ${activeDay}.` : "Hover over today's card to preview the exact time-wise plan.");
  text("markDayBtn", complete ? "Day Completed" : "Mark Day Complete");
  text("focusBadgeText", `DAY ${Math.max(1, weekDays.indexOf(activeDay) + 1)} OF ${adaptivePlan?.daysUntilExam || weekDays.length}`);
  el("planList").innerHTML = sessions.map((item, i) => `<div class="plan-item"><div class="plan-time">${escapeHTML(item[0])} • ${escapeHTML(item[1])}</div><div class="plan-title">${escapeHTML(item[2])}</div><div class="plan-topic">Block ${i + 1} · ${minutes(item[0])} min</div></div>`).join("");
  el("practiceList").innerHTML = sessions.map((item, i) => { const key = sessionKey(activeDay, i); const done = isSessionComplete(activeDay, item, i); const action = item[4] === "practice" && adaptivePlan?.questions?.length ? `<a class="practice-action" href="quiz.html?subject=custom&topic=${encodeURIComponent(item[5])}&topicId=${encodeURIComponent(item[3])}">Start Practice</a>` : `<button class="practice-action${done ? " done" : ""}" data-practice-key="${escapeHTML(key)}" data-practice-day="${escapeHTML(activeDay)}" type="button">${done ? "Done" : "Complete"}</button>`; return `<article class="practice-item"><div class="practice-item-main"><strong>${escapeHTML(item[1])}: ${escapeHTML(item[2])}</strong><p>${escapeHTML(item[0])} • ${minutes(item[0])} min</p></div>${action}</article>`; }).join("");
  text("practiceCount", `${sessions.length} tasks`); text("decisionObserved", complete ? `You completed the ${activeDay} plan.` : `${activeDay} has ${sessions.length} focused blocks ready.`); text("decisionText", selectedSubject ? `Prioritise ${selectedSubject} while keeping practice and recall in the plan.` : adaptivePlan ? `Prioritise ${topicForDay(activeDay)?.title || adaptivePlan.subject} before the target date.` : "Keep today's plan balanced across concept, practice and recall."); text("decisionAction", "The selected-day schedule is ready with time-wise study and practice blocks."); text("decisionReview", activeDay === weekDays[weekDays.length - 1] ? "After the final review" : "After the final session");
  renderWeekPlan();
  renderProgress();
}

function renderProgress() {
  const all = adaptivePlan?.topics?.length
    ? adaptivePlan.topics.flatMap(topic => [["learn", topic.learnMinutes], ["practice", topic.practiceMinutes], ["revision", topic.revisionMinutes]].map(([stage, duration], index) => ({ topic, stage, duration, index })))
    : weekDays.flatMap(day => (plans[day] || []).map((item, index) => ({ day, item, index })));
  const done = all.filter(entry => entry.topic
    ? isPlanSessionComplete(entry.topic, entry.index, entry.stage)
    : isSessionComplete(entry.day, entry.item, entry.index)).length;
  const percent = all.length ? Math.min(100, Math.round(done / all.length * 100)) : 0;
  const planned = adaptivePlan
    ? all.reduce((sum, entry) => sum + Number(entry.duration || 0), 0)
    : all.reduce((sum, entry) => sum + minutes(entry.item[0]), 0);
  const todaySessions = plans[activeDay] || []; const todayDone = todaySessions.filter((item, index) => isSessionComplete(activeDay, item, index)).length; const todayPercent = todaySessions.length ? Math.round(todayDone / todaySessions.length * 100) : 0;
  text("progressPlanned", hours(planned)); text("progressCompleted", hours(Math.round(planned * percent / 100))); text("progressSessions", `${done} / ${all.length}`); text("progressPercent", `${percent}%`); el("progressBar").style.width = `${percent}%`; text("progressNote", `${percent}% of your tracked study blocks are complete.`); text("readinessValue", `${todayPercent}%`); text("readinessRingText", `${todayPercent}`); text("readinessText", todayPercent === 100 ? `${activeDay} plan complete. Great work.` : `${todayDone} of ${todaySessions.length} ${activeDay} tasks complete.`); el("readinessRing").style.background = `conic-gradient(var(--green) ${todayPercent * 3.6}deg, #e8e6df 0deg)`;
}

function renderWeekPlan() {
  const tabs = weekDays.map(day => `<button class="week-day-tab${weekDay === day ? " active" : ""}${today === day ? " today" : ""}" data-week-day="${escapeHTML(day)}" type="button"><span>${escapeHTML(day.slice(0, 3))}</span><strong>${(plans[day] || []).length}</strong></button>`).join("");
  el("weekDayTabs").innerHTML = tabs;
  const list = (plans[weekDay] || []).map((item, index) => { const key = sessionKey(weekDay, index); const done = isSessionComplete(weekDay, item, index); return `<article class="practice-item"><div class="practice-item-main"><strong>${escapeHTML(item[1])}: ${escapeHTML(item[2])}</strong><p>${escapeHTML(item[0])} • ${minutes(item[0])} min</p></div><button class="practice-action${done ? " done" : ""}" data-practice-key="${escapeHTML(key)}" data-practice-day="${escapeHTML(weekDay)}" type="button">${done ? "Done" : "Complete"}</button></article>`; }).join("");
  el("weekPlanList").innerHTML = list;
  text("weekPlanLabel", `${weekDay} plan`);
}

function renderSubjects() {
  const html = subjects.map(subject => `<button class="subject-chip${selectedSubject === subject ? " active" : ""}" data-subject="${escapeHTML(subject)}" type="button"><span>Study block</span><strong>${escapeHTML(subject)}</strong></button>`).join("");
  el("subjectGrid").innerHTML = html; el("drawerSubjects").innerHTML = html.replaceAll("subject-chip", "drawer-subject");
  text("subjectCount", `${subjects.length} subject${subjects.length === 1 ? "" : "s"}`);
}

async function renderExamPlan() {
  if (!window.GuruLearning) return;
  const plan = await window.GuruLearning.loadPlan();
  const panel = el("examPlanPanel");
  const topicsElement = el("examPlanTopics");
  if (!panel || !topicsElement || !plan?.topics?.length) return;

  const remainingDays = Math.max(0, Math.ceil((new Date(`${plan.examDate}T00:00:00`) - new Date(new Date().toDateString())) / 86400000));
  panel.hidden = false;
  if (el("weekendTestSection")) el("weekendTestSection").hidden = true;
  text("examPlanTitle", `${plan.subject} exam plan`);
  text("examPlanSummary", `${plan.dailyMinutes} minutes daily · ${plan.topics.length} study days · ${plan.profile?.prompt || plan.goal}`);
  text("examPlanCountdown", remainingDays === 0 ? "Exam day" : `${remainingDays} day${remainingDays === 1 ? "" : "s"} to exam`);
  text("countdownValue", remainingDays === 0 ? "Exam Day" : `${remainingDays} Days Remaining`);
  text("headerSubtitle", `${plan.subject} · ${plan.dailyMinutes} minutes daily · ${plan.profile?.prompt || plan.goal}`);
  text("weekPlanTitle", `${Math.min(plan.topics.length, 7)}-day ${plan.subject} study plan`);
  text("progressHeading", `${plan.subject} exam progress`);
  topicsElement.replaceChildren();

  const subjectId = Array.isArray(plan.questions) && plan.questions.length
    ? "custom"
    : ({ Python: "python", DBMS: "dbms", "Operating Systems": "os", "Software Engineering": "se" }[plan.subject] || "python");
  const level = String(plan.profile?.level || "").toLowerCase();
  const difficulty = /advanced|expert|hard/.test(level) ? "hard" : /beginner|new/.test(level) ? "easy" : "medium";
  plan.topics.forEach(topic => {
    const article = document.createElement("article");
    article.className = `exam-plan-topic${topic.completed ? " completed" : ""}`;

    const day = document.createElement("span");
    day.className = "exam-plan-day";
    day.textContent = `DAY ${topic.day}`;

    const title = document.createElement("h3");
    title.textContent = topic.title;

    const details = document.createElement("p");
    details.textContent = `Study ${topic.learnMinutes} min · Practice ${topic.practiceMinutes} min${topic.attempts ? ` · ${Number(topic.accuracy) || 0}% quiz accuracy` : ""}`;

    const link = document.createElement("a");
    link.className = "exam-plan-link";
    link.href = `quiz.html?subject=${subjectId}&difficulty=${difficulty}&topic=${encodeURIComponent(topic.quizTopic)}&topicId=${encodeURIComponent(topic.topicId)}`;
    link.textContent = topic.completed ? "Practice again" : "Start topic practice";

    article.append(day, title, details, link);
    topicsElement.appendChild(article);
  });

  adaptivePlan = plan;
  const visibleTopics = plan.topics.slice(0, 7);
  weekDays = visibleTopics.map(topic => dayNames[new Date(`${topic.date}T00:00:00`).getDay()]);
  if (!weekDays.length) weekDays = [today];
  subjects = [plan.subject];
  plans = Object.fromEntries(visibleTopics.map((topic, index) => {
    const day = weekDays[index];
    const blocks = [
      [topic.learnMinutes, plan.subject, topic.title, topic.topicId, "learn", topic.quizTopic],
      [topic.practiceMinutes, "Practice", `${topic.title} questions`, topic.topicId, "practice", topic.quizTopic],
      [topic.revisionMinutes, "Revision", `${topic.title} recall and review`, topic.topicId, "revision", topic.quizTopic]
    ];
    let minute = 8 * 60;
    const sessions = blocks.map(([duration, label, title, topicId, stage, quizTopic]) => {
      const startHour = Math.floor(minute / 60);
      const startMinute = minute % 60;
      minute += Number(duration);
      const endHour = Math.floor(minute / 60);
      const endMinute = minute % 60;
      const clock = (hour, mins) => `${String(hour).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
      return [`${clock(startHour, startMinute)} - ${clock(endHour, endMinute)}`, label, title, topicId, stage, quizTopic];
    });
    return [day, sessions];
  }));
  weekDay = weekDays[0];
  activeDay = weekDay;
  selectedSubject = null;
  text("focusBadgeText", `DAY 1 OF ${plan.daysUntilExam}`);
  renderSubjects();
  render();
}

function scrollTo(id) { el(id)?.scrollIntoView({ behavior: "smooth" }); el("sidebar")?.classList.remove("open"); el("mobileOverlay")?.classList.remove("show"); }
function toast(message) { const item = document.createElement("div"); item.className = "toast"; item.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`; document.body.appendChild(item); setTimeout(() => item.remove(), 2200); }

window.addEventListener("DOMContentLoaded", () => {
  renderSubjects(); render(); renderExamPlan();
  const button = document.querySelector('[data-weekend-test="Sunday"]'); const active = today === "Sunday"; button.disabled = !active; button.textContent = active ? "Open Test" : "Locked"; el("sunCountdown").textContent = active ? "Available today" : "Waiting for Sunday";
  button.addEventListener("click", () => { if (today === "Sunday") toast("Sunday test opened: 25 questions, 45 minutes maximum."); });
  document.querySelectorAll(".nav-item[data-target]").forEach(button => button.addEventListener("click", () => scrollTo(button.dataset.target)));
  document.addEventListener("click", event => { const subject = event.target.closest("[data-subject]"); if (subject) { selectedSubject = subject.dataset.subject; renderSubjects(); render(); } const practice = event.target.closest("[data-practice-key]"); if (practice) { state.completed[practice.dataset.practiceKey] = !state.completed[practice.dataset.practiceKey]; saveState(); render(); } });
  el("clearSubjectFilter").addEventListener("click", () => { selectedSubject = null; renderSubjects(); render(); });
  el("markDayBtn").addEventListener("click", () => {
    const sessions = plans[activeDay] || [];
    const complete = sessions.length > 0 && sessions.every((item, index) => isSessionComplete(activeDay, item, index));
    sessions.forEach((item, index) => { state.completed[sessionKey(activeDay, index)] = !complete; });
    const topic = topicForDay(activeDay);
    if (topic && !topic.attempts) {
      topic.completed = !complete;
      window.GuruLearning?.savePlan(adaptivePlan);
    }
    saveState();
    render();
  });
  el("practiceFromDayBtn").addEventListener("click", () => scrollTo("practiceSection")); el("quickPracticeBtn").addEventListener("click", () => scrollTo("practiceSection")); el("quickStartBtn").addEventListener("click", () => toast(`Starting the first ${activeDay} session.`)); el("quickAdaptBtn").addEventListener("click", () => toast("Plan adapted around your current progress."));
  document.addEventListener("click", event => {
    const dayButton = event.target.closest("[data-week-day]");
    if (dayButton) { weekDay = dayButton.dataset.weekDay; activeDay = weekDay; render(); return; }
    const practiceButton = event.target.closest("[data-practice-key]");
    if (!practiceButton) return;
    const day = practiceButton.dataset.practiceDay;
    const key = practiceButton.dataset.practiceKey;
    state.completed[key] = !state.completed[key];
    const topic = topicForDay(day);
    const sessions = plans[day] || [];
    if (topic && !topic.attempts) {
      topic.completed = sessions.every((item, index) => isSessionComplete(day, item, index));
      window.GuruLearning?.savePlan(adaptivePlan);
    }
    saveState();
    render();
  });
  el("subjectDrawerClose").addEventListener("click", () => el("subjectDrawer").classList.remove("open")); el("mobileMenuBtn").addEventListener("click", () => { el("sidebar").classList.add("open"); el("mobileOverlay").classList.add("show"); }); el("mobileOverlay").addEventListener("click", () => scrollTo("todaySection"));
});
