document.addEventListener('DOMContentLoaded', async () => {
    const plan = await window.GuruLearning?.loadPlan();
    const history = window.GuruLearning?.getHistory() || readHistory();
    const totalQuestions = history.reduce((sum, item) => sum + questionCount(item), 0);
    const totalCorrect = history.reduce((sum, item) => sum + correctCount(item), 0);
    const averageAccuracy = totalQuestions ? Math.round(totalCorrect * 100 / totalQuestions) : 0;

    setText('overallScore', `${averageAccuracy}%`);
    setText('questionsPracticed', totalQuestions);
    setText('averageAccuracy', `${averageAccuracy}%`);
    setText('currentStreak', `${calculateStreak(history)} Days 🔥`);

    const recentList = document.getElementById('recentProgressList');
    if (recentList) {
        if (!history.length) {
            recentList.innerHTML = '<p class="section-subtitle">Complete a quiz to see your recent progress here.</p>';
        } else {
            recentList.innerHTML = history.slice(0, 5).map(item => `
                <div class="progress-row">
                    <div>
                        <strong>${escapeHtml(item.name || item.subject || 'Practice Quiz')}</strong>
                        <span>${escapeHtml(item.date || 'Recent')}${item.topic ? ` · ${escapeHtml(item.topic)}` : ''}</span>
                    </div>
                    <div class="progress-score">
                        <strong>${Number(item.accuracy || 0)}%</strong>
                        <span>${correctCount(item)} / ${questionCount(item)} correct</span>
                    </div>
                </div>
            `).join('');
        }
    }

    updateSubjectAccuracy(history);
    renderTopicStrengths(history);
    renderWeeklyChart(history);
    renderPlanProgress(plan);

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function calculateStreak(items) {
        const dates = [...new Set(items.map(item => new Date(item.savedAt || item.date).toDateString()).filter(date => date !== 'Invalid Date'))]
            .map(date => new Date(date).setHours(0, 0, 0, 0))
            .sort((a, b) => b - a);
        if (!dates.length) return 0;

        let streak = 1;
        for (let index = 1; index < dates.length; index += 1) {
            if (dates[index - 1] - dates[index] !== 86400000) break;
            streak += 1;
        }
        return streak;
    }

    function readHistory() {
        try {
            const saved = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    }

    function questionCount(item) {
        if (Array.isArray(item.questions)) return item.questions.length;
        return Number(item.questionCount || item.questions || Number(item.correct || 0) + Number(item.wrong || 0));
    }

    function correctCount(item) {
        if (Array.isArray(item.questions)) return item.questions.filter(question => question.isCorrect).length;
        if (item.correct !== undefined) return Number(item.correct) || 0;
        const score = String(item.score || '').match(/^\s*(\d+)/);
        return score ? Number(score[1]) : Number(item.score || 0);
    }

    function updateSubjectAccuracy(items) {
        const subjectStats = new Map();
        items.forEach(item => {
            const subject = item.subject || item.name || '';
            const stats = subjectStats.get(subject) || { questions: 0, correct: 0 };
            stats.questions += questionCount(item);
            stats.correct += correctCount(item);
            subjectStats.set(subject, stats);
        });

        const container = document.getElementById('subjectPerformanceList');
        if (!container) return;
        container.replaceChildren();

        if (!subjectStats.size) {
            container.innerHTML = '<p class="section-subtitle">Complete a practice session to see subject accuracy.</p>';
            return;
        }

        [...subjectStats.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([subject, stats]) => {
            const accuracy = stats.questions ? Math.round(stats.correct * 100 / stats.questions) : 0;
            const item = document.createElement('div');
            item.className = 'subject-item';
            const heading = document.createElement('div');
            heading.className = 'subject-header';
            const name = document.createElement('span');
            name.textContent = subject;
            const value = document.createElement('strong');
            value.textContent = `${accuracy}%`;
            heading.append(name, value);
            const bar = document.createElement('div');
            bar.className = 'progress-bar';
            const fill = document.createElement('div');
            fill.className = 'progress-fill';
            fill.style.width = `${accuracy}%`;
            bar.appendChild(fill);
            item.append(heading, bar);
            container.appendChild(item);
        });
    }

    function renderTopicStrengths(items) {
        const stats = new Map();
        items.forEach(session => {
            if (!Array.isArray(session.questions)) return;
            session.questions.forEach(question => {
                if (!question.topic) return;
                const current = stats.get(question.topic) || { attempts: 0, correct: 0 };
                current.attempts++;
                if (question.isCorrect) current.correct++;
                stats.set(question.topic, current);
            });
        });

        const topics = [...stats.entries()].map(([topic, result]) => ({
            topic,
            accuracy: Math.round(result.correct * 100 / result.attempts),
            attempts: result.attempts
        }));
        const renderList = (id, results, emptyText) => {
            const list = document.getElementById(id);
            if (!list) return;
            list.replaceChildren();
            if (!results.length) {
                const empty = document.createElement('p');
                empty.className = 'section-subtitle';
                empty.textContent = emptyText;
                list.appendChild(empty);
                return;
            }
            results.forEach(result => {
                const row = document.createElement('div');
                row.className = 'area-item';
                const name = document.createElement('span');
                name.textContent = result.topic;
                const accuracy = document.createElement('strong');
                accuracy.textContent = `${result.accuracy}% · ${result.attempts} Q`;
                row.append(name, accuracy);
                list.appendChild(row);
            });
        };

        renderList('strongTopicsList', topics.filter(topic => topic.accuracy >= 70).sort((a, b) => b.accuracy - a.accuracy).slice(0, 3), 'No strong topic yet; keep practicing to build a reliable score.');
        renderList('weakTopicsList', topics.filter(topic => topic.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3), 'Topics to improve appear after practice.');
    }

    function renderWeeklyChart(items) {
        const containers = [...document.querySelectorAll('.chart-bars .bar-container')];
        const weeks = Array.from({ length: containers.length }, () => ({ questions: 0, correct: 0 }));
        const now = new Date();
        items.forEach(item => {
            const date = new Date(item.savedAt || item.date);
            if (Number.isNaN(date.getTime())) return;
            const weeksAgo = Math.floor((now - date) / (7 * 86400000));
            if (weeksAgo < 0 || weeksAgo >= weeks.length) return;
            const bucket = weeks[weeks.length - 1 - weeksAgo];
            bucket.questions += questionCount(item);
            bucket.correct += correctCount(item);
        });

        containers.forEach((container, index) => {
            const stats = weeks[index];
            const accuracy = stats.questions ? Math.round(stats.correct * 100 / stats.questions) : 0;
            const bar = container.querySelector('.bar');
            const label = container.querySelector('span');
            if (bar) bar.style.height = `${accuracy}%`;
            if (label) label.textContent = stats.questions ? `${stats.questions} Q` : 'No data';
        });
    }

    function renderPlanProgress(plan) {
        const panel = document.getElementById('learningPlanProgress');
        const list = document.getElementById('learningPlanProgressTopics');
        const summary = document.getElementById('planProgressSummary');
        if (!panel || !list) return;
        if (!plan?.topics?.length) {
            panel.hidden = true;
            return;
        }

        panel.hidden = false;
        const completed = plan.topics.filter(topic => topic.completed).length;
        const completion = Math.round(completed * 100 / plan.topics.length);
        const examDate = plan.examDate ? new Date(`${plan.examDate}T00:00:00`) : null;
        const formattedExamDate = examDate && !Number.isNaN(examDate.getTime())
            ? examDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Date not set';
        if (summary) summary.textContent = `${plan.subject} · ${plan.dailyMinutes} minutes a day · ${plan.topics.length} focused sessions`;
        const progressCount = document.getElementById('planProgressCount');
        if (progressCount) progressCount.textContent = `${completed} / ${plan.topics.length}`;
        const examDateLabel = document.getElementById('planExamDate');
        if (examDateLabel) examDateLabel.textContent = `Exam date · ${formattedExamDate}`;
        const progressBar = document.getElementById('planProgressBar');
        const progressTrack = progressBar?.parentElement;
        if (progressBar) progressBar.style.width = `${completion}%`;
        if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(completion));
        list.replaceChildren();
        const subjectId = Array.isArray(plan.questions) && plan.questions.length
            ? 'custom'
            : ({ Python: 'python', DBMS: 'dbms', 'Operating Systems': 'os', 'Software Engineering': 'se' }[plan.subject] || 'python');
        const level = String(plan.profile?.level || '').toLowerCase();
        const difficulty = /advanced|expert|hard/.test(level) ? 'hard' : /beginner|new/.test(level) ? 'easy' : 'medium';
        const practiceUrl = topic => `quiz.html?subject=${subjectId}&difficulty=${difficulty}&topic=${encodeURIComponent(topic.quizTopic)}&topicId=${encodeURIComponent(topic.topicId)}`;
        const nextTopic = plan.topics.find(topic => !topic.completed) || plan.topics[0];
        const startPractice = document.getElementById('planStartPractice');
        if (startPractice && nextTopic) {
            startPractice.href = practiceUrl(nextTopic);
            const startPracticeLabel = document.getElementById('planStartPracticeLabel');
            if (startPracticeLabel) {
                startPracticeLabel.textContent = nextTopic.completed ? 'Practice again' : 'Start next practice';
            }
        }

        plan.topics.forEach(topic => {
            const row = document.createElement('article');
            row.className = `plan-topic-card${topic.completed ? ' is-complete' : ''}`;
            const cardHeader = document.createElement('div');
            cardHeader.className = 'plan-topic-header';
            const day = document.createElement('span');
            day.className = 'plan-topic-day';
            day.textContent = `DAY ${topic.day}`;
            const status = document.createElement('span');
            status.className = `plan-topic-status${topic.completed ? ' is-complete' : ''}`;
            status.textContent = topic.completed ? 'Complete' : 'Up next';
            cardHeader.append(day, status);

            const title = document.createElement('h3');
            title.textContent = topic.title;
            const details = document.createElement('p');
            details.className = 'plan-topic-details';
            details.textContent = `Study ${topic.learnMinutes} min · Practice ${topic.practiceMinutes} min`;

            const result = document.createElement('div');
            result.className = 'plan-topic-result';
            const score = document.createElement('span');
            score.textContent = topic.attempts
                ? `${Number(topic.accuracy) || 0}% accuracy · ${topic.attempts} questions`
                : (topic.completed ? 'Session practiced' : 'Not practiced yet');
            result.appendChild(score);

            const link = document.createElement('a');
            link.className = 'plan-topic-action';
            link.href = practiceUrl(topic);
            link.textContent = topic.completed ? 'Practice again' : 'Start practice';
            link.setAttribute('aria-label', `${link.textContent}: ${topic.title}`);
            link.appendChild(document.createTextNode(' →'));
            row.append(cardHeader, title, details, result, link);
            list.appendChild(row);
        });
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        })[character]);
    }
});
