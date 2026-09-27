 /* =====================================================
    GURUAGENT - QUIZ LOGIC
 ===================================================== */


/* =====================================================
   QUESTION BANK
===================================================== */

const questionBank = {

    python: [
        {
            question: "Which keyword is used to define a function in Python?",
            options: ["function", "def", "define", "func"],
            answer: 1,
            topic: "Function definitions",
            explanation: "`def` is Python's keyword for starting a function definition.",
            wrongReasons: {
                0: "`function` is used in some other languages, but Python uses `def`.",
                2: "`define` is not a Python keyword for declaring functions.",
                3: "`func` is not Python syntax for a function definition."
            }
        },
        {
            question: "Which data type is immutable in Python?",
            options: ["List", "Dictionary", "Tuple", "Set"],
            answer: 2,
            topic: "Data types and mutability",
            explanation: "A tuple cannot be changed after it is created, so it is immutable.",
            wrongReasons: {
                0: "A list is mutable; its items can be added, removed, or changed.",
                1: "A dictionary is mutable; keys and values can be changed.",
                3: "A set is mutable; items can be added or removed."
            }
        },
        {
            question: "Which symbol is used for comments in Python?",
            options: ["//", "#", "/*", "--"],
            answer: 1,
            topic: "Python syntax",
            explanation: "In Python, `#` starts a single-line comment.",
            wrongReasons: {
                0: "`//` is commonly used for comments in other languages; in Python it means floor division.",
                2: "`/* ... */` is a block-comment style from other languages, not Python syntax.",
                3: "`--` is not Python's comment marker."
            }
        },
        {
            question: "What is the output type of input() in Python?",
            options: ["Integer", "Float", "String", "Boolean"],
            answer: 2,
            topic: "Input and output",
            explanation: "`input()` returns the entered text as a string; convert it explicitly if you need a number.",
            wrongReasons: {
                0: "`input()` does not automatically convert the entered text to an integer.",
                1: "`input()` does not automatically convert the entered text to a float.",
                3: "`input()` does not automatically convert the entered text to a boolean."
            }
        },
        {
            question: "Which function is used to find the length of a list?",
            options: ["size()", "count()", "length()", "len()"],
            answer: 3,
            topic: "Built-in functions",
            explanation: "`len(list)` is Python's built-in way to get the number of items in a list.",
            wrongReasons: {
                0: "`size()` is not the standard Python built-in for measuring a list.",
                1: "`count()` counts occurrences of a particular value, not the total list length.",
                2: "`length()` is not Python's built-in list-length function."
            }
        }
    ],


    os: [
        {
            question: "Which of the following is a process state?",
            options: ["Ready", "Compile", "Execute", "Build"],
            answer: 0,
            topic: "Process states",
            explanation: "Ready is a process state: the process can run and is waiting for CPU time.",
            wrongReasons: {
                1: "Compile describes a development action, not a standard process state.",
                2: "Execute describes running, but it is not one of the standard named states in this list.",
                3: "Build is a development action, not a process state."
            }
        },
        {
            question: "Which algorithm is used for deadlock avoidance?",
            options: [
                "FCFS",
                "Banker's Algorithm",
                "Round Robin",
                "FIFO"
            ],
            answer: 1,
            topic: "Deadlocks",
            explanation: "Banker's Algorithm checks whether resource allocation leaves the system in a safe state.",
            wrongReasons: {
                0: "FCFS is a CPU scheduling algorithm, not a deadlock-avoidance algorithm.",
                2: "Round Robin schedules CPU time; it does not avoid deadlocks.",
                3: "FIFO is a queue/replacement policy, not the deadlock-avoidance algorithm here."
            }
        },
        {
            question: "Which scheduling algorithm uses a time quantum?",
            options: [
                "FCFS",
                "SJF",
                "Round Robin",
                "Priority"
            ],
            answer: 2,
            topic: "CPU scheduling",
            explanation: "Round Robin gives each ready process a fixed time quantum in turn.",
            wrongReasons: {
                0: "FCFS runs jobs in arrival order and does not use a repeating time quantum.",
                1: "SJF chooses the shortest job; it does not allocate a rotating time quantum.",
                3: "Priority scheduling selects by priority rather than a rotating time quantum."
            }
        },
        {
            question: "What does CPU stand for?",
            options: [
                "Central Processing Unit",
                "Central Program Unit",
                "Computer Processing Utility",
                "Control Processing Unit"
            ],
            answer: 0,
            topic: "CPU fundamentals",
            explanation: "CPU stands for Central Processing Unit, the computer component that executes instructions.",
            wrongReasons: {
                1: "`Central Program Unit` is not the expansion of CPU.",
                2: "`Computer Processing Utility` is not the expansion of CPU.",
                3: "`Control Processing Unit` is not the expansion of CPU."
            }
        },
        {
            question: "Which condition is necessary for deadlock?",
            options: [
                "Mutual Exclusion",
                "Compilation",
                "Paging",
                "Spooling"
            ],
            answer: 0,
            topic: "Deadlocks",
            explanation: "Mutual exclusion is one of the necessary Coffman conditions for deadlock.",
            wrongReasons: {
                1: "Compilation is not one of the necessary conditions for deadlock.",
                2: "Paging is a memory-management technique, not a Coffman deadlock condition.",
                3: "Spooling is an I/O technique, not a Coffman deadlock condition."
            }
        }
    ],


    dbms: [
        {
            question: "What does DBMS stand for?",
            options: [
                "Database Management System",
                "Data Backup Management System",
                "Database Machine System",
                "Data Management Software"
            ],
            answer: 0,
            topic: "DBMS fundamentals",
            explanation: "DBMS expands to Database Management System, software for managing databases.",
            wrongReasons: {
                1: "`Data Backup Management System` is not the standard expansion of DBMS.",
                2: "`Database Machine System` is not the standard expansion of DBMS.",
                3: "`Data Management Software` is not the standard expansion of DBMS."
            }
        },
        {
            question: "Which language is commonly used to query databases?",
            options: ["HTML", "SQL", "CSS", "Python"],
            answer: 1,
            topic: "SQL",
            explanation: "SQL is the language used to query and manage relational databases.",
            wrongReasons: {
                0: "HTML structures web pages; it is not a database query language.",
                2: "CSS styles web pages; it is not a database query language.",
                3: "Python is a general-purpose language, while SQL is used to query relational databases."
            }
        },
        {
            question: "Which key uniquely identifies a record?",
            options: [
                "Foreign Key",
                "Primary Key",
                "Candidate Key",
                "Composite Key"
            ],
            answer: 1,
            topic: "Database keys",
            explanation: "A primary key uniquely identifies each record in a table.",
            wrongReasons: {
                0: "A foreign key refers to a key in another table; it is not necessarily unique in this table.",
                2: "A candidate key can uniquely identify records, but the selected primary key is the designated identifier.",
                3: "A composite key uses multiple columns; it is not the single key asked for here."
            }
        },
        {
            question: "Which command is used to retrieve data?",
            options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
            answer: 2,
            topic: "SQL queries",
            explanation: "`SELECT` retrieves rows from a database table.",
            wrongReasons: {
                0: "`INSERT` adds new rows instead of retrieving existing data.",
                1: "`UPDATE` changes existing rows instead of retrieving them.",
                3: "`DELETE` removes rows instead of retrieving them."
            }
        },
        {
            question: "Which normal form removes partial dependency?",
            options: [
                "1NF",
                "2NF",
                "3NF",
                "BCNF"
            ],
            answer: 1,
            topic: "Normalization",
            explanation: "Second Normal Form removes partial dependencies on part of a composite key.",
            wrongReasons: {
                0: "First Normal Form handles atomic values and repeating groups, not partial dependencies.",
                2: "Third Normal Form removes transitive dependencies; 2NF addresses partial dependencies.",
                3: "BCNF is a stronger form focused on determinants and candidate keys, not the named step for partial dependencies."
            }
        }
    ],


    se: [
        {
            question: "What does SDLC stand for?",
            options: [
                "Software Development Life Cycle",
                "System Design Life Cycle",
                "Software Design Level Cycle",
                "System Development Logic Cycle"
            ],
            answer: 0,
            topic: "Software development life cycle",
            explanation: "SDLC means Software Development Life Cycle, the process used to build and maintain software.",
            wrongReasons: {
                1: "`System Design Life Cycle` is not the standard expansion of SDLC.",
                2: "`Software Design Level Cycle` is not the standard expansion of SDLC.",
                3: "`System Development Logic Cycle` is not the standard expansion of SDLC."
            }
        },
        {
            question: "Which model follows a sequential approach?",
            options: [
                "Agile",
                "Spiral",
                "Waterfall",
                "Prototype"
            ],
            answer: 2,
            topic: "Development models",
            explanation: "The Waterfall model proceeds through development phases in a sequential order.",
            wrongReasons: {
                0: "Agile is iterative and incremental rather than a strictly sequential model.",
                1: "Spiral is iterative and risk-driven, not the sequential model asked for.",
                3: "Prototyping centers on building and refining prototypes, not a sequential phase flow."
            }
        },
        {
            question: "Which testing tests individual components?",
            options: [
                "System Testing",
                "Integration Testing",
                "Unit Testing",
                "Acceptance Testing"
            ],
            answer: 2,
            topic: "Software testing",
            explanation: "Unit testing checks individual functions or components in isolation.",
            wrongReasons: {
                0: "System testing checks the complete integrated system, not individual components.",
                1: "Integration testing checks interactions between combined components.",
                3: "Acceptance testing checks whether the product meets user or business requirements."
            }
        },
        {
            question: "What does UI stand for?",
            options: [
                "User Interface",
                "Universal Interface",
                "User Integration",
                "Utility Interface"
            ],
            answer: 0,
            topic: "User interfaces",
            explanation: "UI means User Interface: the parts of a product people interact with.",
            wrongReasons: {
                1: "`Universal Interface` is not the standard expansion of UI in software.",
                2: "`User Integration` is not the standard expansion of UI.",
                3: "`Utility Interface` is not the standard expansion of UI."
            }
        },
        {
            question: "Which metric measures software complexity?",
            options: [
                "Halstead Metrics",
                "Network Metrics",
                "Hardware Metrics",
                "Memory Metrics"
            ],
            answer: 0,
            topic: "Software metrics",
            explanation: "Halstead Metrics use operators and operands to estimate software complexity.",
            wrongReasons: {
                1: "Network metrics describe network properties, not software code complexity.",
                2: "Hardware metrics describe hardware characteristics, not software complexity.",
                3: "Memory metrics describe memory use, not the software complexity metric asked for."
            }
        }
    ],


    emerging: [
        {
            question: "What does AI stand for?",
            options: [
                "Artificial Intelligence",
                "Automated Information",
                "Advanced Internet",
                "Artificial Integration"
            ],
            answer: 0,
            topic: "Artificial intelligence",
            explanation: "AI stands for Artificial Intelligence, the field of building systems that perform intelligent tasks.",
            wrongReasons: {
                1: "`Automated Information` is not the expansion of AI.",
                2: "`Advanced Internet` is not the expansion of AI.",
                3: "`Artificial Integration` is not the expansion of AI."
            }
        },
        {
            question: "Which field deals with understanding human language?",
            options: [
                "Computer Vision",
                "NLP",
                "Robotics",
                "Cloud Computing"
            ],
            answer: 1,
            topic: "Natural language processing",
            explanation: "NLP (Natural Language Processing) focuses on computers understanding and working with human language.",
            wrongReasons: {
                0: "Computer vision analyzes visual information, such as images, rather than language.",
                2: "Robotics concerns robots and physical tasks; it is not specifically language understanding.",
                3: "Cloud computing provides computing services; it is not the field focused on human language."
            }
        },
        {
            question: "Which technology is associated with distributed data processing?",
            options: [
                "Hadoop",
                "HTML",
                "CSS",
                "Bootstrap"
            ],
            answer: 0,
            topic: "Distributed data processing",
            explanation: "Hadoop is a framework for storing and processing large datasets across distributed machines.",
            wrongReasons: {
                1: "HTML marks up web content; it does not distribute data processing.",
                2: "CSS styles web content; it does not distribute data processing.",
                3: "Bootstrap is a front-end UI toolkit, not a distributed data-processing framework."
            }
        },
        {
            question: "Computer Vision mainly deals with:",
            options: [
                "Images and videos",
                "Databases",
                "Operating systems",
                "Networks"
            ],
            answer: 0,
            topic: "Computer vision",
            explanation: "Computer vision enables computers to interpret images and videos.",
            wrongReasons: {
                1: "Databases are about storing and querying structured data, not visual interpretation.",
                2: "Operating systems manage computer resources; they are not the focus of computer vision.",
                3: "Networks connect devices; they are not the focus of computer vision."
            }
        },
        {
            question: "PyTorch is mainly used for:",
            options: [
                "Web designing",
                "Machine learning and deep learning",
                "Database management",
                "Operating systems"
            ],
            answer: 1,
            topic: "Machine learning",
            explanation: "PyTorch is a machine-learning framework widely used for deep-learning models.",
            wrongReasons: {
                0: "PyTorch is not a web-design tool; it is used to build and train machine-learning models.",
                2: "PyTorch is not database-management software.",
                3: "PyTorch is not an operating system."
            }
        }
    ],


    itwd: [
        {
            question: "What does HTML stand for?",
            options: [
                "Hyper Text Markup Language",
                "High Text Machine Language",
                "Hyperlink Text Management Language",
                "Home Tool Markup Language"
            ],
            answer: 0,
            topic: "HTML",
            explanation: "HTML means Hyper Text Markup Language, the markup language used to structure web pages.",
            wrongReasons: {
                1: "`High Text Machine Language` is not the expansion of HTML.",
                2: "`Hyperlink Text Management Language` is not the expansion of HTML.",
                3: "`Home Tool Markup Language` is not the expansion of HTML."
            }
        },
        {
            question: "Which language is used for styling web pages?",
            options: ["HTML", "CSS", "SQL", "Python"],
            answer: 1,
            topic: "CSS",
            explanation: "CSS controls the presentation and visual styling of web pages.",
            wrongReasons: {
                0: "HTML defines page structure and content; CSS is used for styling.",
                2: "SQL is used for querying databases, not styling web pages.",
                3: "Python is a general-purpose programming language, not the standard page-styling language."
            }
        },
        {
            question: "Which language is mainly used to add interactivity to web pages?",
            options: [
                "HTML",
                "CSS",
                "JavaScript",
                "SQL"
            ],
            answer: 2,
            topic: "JavaScript",
            explanation: "JavaScript is commonly used to add behavior and interactivity to web pages.",
            wrongReasons: {
                0: "HTML structures page content but does not provide the main scripting behavior.",
                1: "CSS styles page content; JavaScript adds interactive behavior.",
                3: "SQL queries databases; it is not used to add browser-page interactivity."
            }
        },
        {
            question: "Which tag is used to create a hyperlink?",
            options: ["<p>", "<a>", "<h1>", "<link>"],
            answer: 1,
            topic: "HTML links",
            explanation: "The `<a>` anchor element creates a hyperlink, usually with an `href` attribute.",
            wrongReasons: {
                0: "`<p>` marks a paragraph, not a hyperlink.",
                2: "`<h1>` marks a top-level heading, not a hyperlink.",
                3: "`<link>` links external resources such as stylesheets; `<a>` creates clickable page links."
            }
        },
        {
            question: "Which protocol is commonly used for web communication?",
            options: [
                "HTTP",
                "FTP",
                "SMTP",
                "SSH"
            ],
            answer: 0,
            topic: "Web protocols",
            explanation: "HTTP is the standard application protocol used to transfer web requests and responses.",
            wrongReasons: {
                1: "FTP is primarily for file transfer, not regular web page communication.",
                2: "SMTP is used to send email, not standard web page requests.",
                3: "SSH is used for secure remote access, not standard web page requests."
            }
        }
    ]
};


/* =====================================================
   GET SUBJECT FROM URL
===================================================== */

const urlParams = new URLSearchParams(
    window.location.search
);

const selectedSubject =
    urlParams.get("subject");

const selectedDifficulty =
    urlParams.get("difficulty");


/* =====================================================
   SUBJECT NAME
===================================================== */

const subjectNames = {

    python: "Python Programming",

    os: "Operating Systems",

    dbms: "DBMS",

    se: "Software Engineering",

    emerging: "Emerging Technologies",

    itwd: "Internet & Web Technology"
};

const difficultyNames = {

    easy: "Easy",

    medium: "Medium",

    hard: "Hard"
};

const selectedDifficultyLabel =
    difficultyNames[selectedDifficulty] || "Mixed";


/* =====================================================
   VALIDATE SUBJECT
===================================================== */

if (!selectedSubject || !questionBank[selectedSubject]) {

    window.location.href = "index.html";

}


/* =====================================================
   CREATE QUIZ QUESTIONS
===================================================== */

let questions = [];


/*
    Only questions from the selected subject
    will be used.

    No mixed practice.
*/

const subjectQuestions =
    questionBank[selectedSubject];

questions =
    shuffleArray([...subjectQuestions]).slice(0, 5);


/* =====================================================
   QUIZ VARIABLES
===================================================== */

let currentQuestion = 0;

let selectedAnswers = [];

let selectedOption = null;


/* =====================================================
   DOM ELEMENTS
===================================================== */

const questionElement =
    document.getElementById("question");

const optionsElement =
    document.getElementById("options");

const questionNumberElement =
    document.getElementById("questionNumber");

const questionNumberSmall =
    document.getElementById("qNumber");

const progressElement =
    document.getElementById(
        "questionProgressFill"
    );

const progressPercentElement =
    document.getElementById(
        "progressPercent"
    );

const subjectElement =
    document.getElementById("subject");

const difficultyElement =
    document.getElementById("difficulty");

const resultElement =
    document.getElementById("result");

const quizContainer =
    document.querySelector(".quiz-container");

const scoreElement =
    document.getElementById("score");

const correctElement =
    document.getElementById("correctCount");

const wrongElement =
    document.getElementById("wrongCount");

const accuracyElement =
    document.getElementById("accuracy");

const retryButton =
    document.getElementById("retryButton");

const hintButton =
    document.getElementById("hintButton");

const hintElement =
    document.getElementById("hint");

const resultSummary =
    document.getElementById("resultSummary");

const answerFeedback =
    document.getElementById("answerFeedback");


/* =====================================================
   SHUFFLE FUNCTION
===================================================== */

function shuffleArray(array) {

    return array.sort(
        () => Math.random() - 0.5
    );

}


/* =====================================================
   LOAD QUESTION
===================================================== */

function loadQuestion() {

    const current =
        questions[currentQuestion];

    selectedOption = null;
    quizContainer.classList.remove("question-exit", "question-enter");
    void quizContainer.offsetWidth;
    quizContainer.classList.add("question-enter");
    quizContainer.addEventListener("animationend", event => {
        if (event.target === quizContainer) {
            quizContainer.classList.remove("question-enter");
        }
    }, { once: true });


    /* ---------------------------------------------
       QUESTION NUMBER
    --------------------------------------------- */

    questionNumberElement.textContent =
        currentQuestion + 1;

    questionNumberSmall.textContent =
        currentQuestion + 1;


    /* ---------------------------------------------
       QUESTION
    --------------------------------------------- */

    questionElement.textContent =
        current.question;


    /* ---------------------------------------------
       SUBJECT
    --------------------------------------------- */

    subjectElement.textContent =
        subjectNames[selectedSubject];


    /* ---------------------------------------------
       DIFFICULTY
    --------------------------------------------- */

    difficultyElement.textContent =
        selectedDifficultyLabel;

    difficultyElement.classList.remove("easy", "medium", "hard");

    if (selectedDifficulty) {
        difficultyElement.classList.add(selectedDifficulty);
    }


    /* ---------------------------------------------
       PROGRESS
    --------------------------------------------- */

    const progress =
        ((currentQuestion + 1) /
            questions.length) * 100;

    progressElement.style.width =
        progress + "%";

    progressPercentElement.textContent =
        Math.round(progress) + "%";


    /* ---------------------------------------------
       CLEAR OLD OPTIONS
    --------------------------------------------- */

    optionsElement.innerHTML = "";


    /* ---------------------------------------------
       CREATE OPTIONS
    --------------------------------------------- */

    current.options.forEach(
        (option, index) => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className = "option";


            button.innerHTML = `
                <span class="option-letter">
                    ${String.fromCharCode(65 + index)}
                </span>

                <span>
                    ${option}
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    selectOption(
                        index,
                        button
                    );

                }
            );


            optionsElement.appendChild(
                button
            );

        }
    );


    /* ---------------------------------------------
       RESET HINT
    --------------------------------------------- */

    hintElement.textContent = "";

    hintElement.classList.remove(
        "show"
    );

    hintButton.textContent =
        "💡 Show Hint";

    answerFeedback.textContent = "";
    answerFeedback.classList.remove("correct", "wrong");

}


/* =====================================================
   SELECT OPTION
===================================================== */

function selectOption(
    index,
    button
) {

    if (selectedOption !== null) {
        return;
    }

    selectedOption = index;

    selectedAnswers[currentQuestion] =
        index;


    /* ---------------------------------------------
       REMOVE PREVIOUS SELECTION
    --------------------------------------------- */

    const allOptions =
        document.querySelectorAll(
            ".option"
        );

    allOptions.forEach(option => {
        option.disabled = true;
        option.classList.remove("selected");
    });


    /* ---------------------------------------------
       HIGHLIGHT SELECTED OPTION
    --------------------------------------------- */

    const current = questions[currentQuestion];
    const isCorrect = index === current.answer;
    const correctButton = allOptions[current.answer];
    correctButton.classList.add("correct", "answer-reveal");

    if (isCorrect) {
        button.classList.add("selected", "correct");
    } else {
        button.classList.add("selected", "wrong");
    }

    answerFeedback.replaceChildren();
    const resultLine = document.createElement("p");
    resultLine.className = `feedback-result ${isCorrect ? "correct" : "wrong"}`;
    const resultLabel = document.createElement("strong");
    resultLabel.textContent = isCorrect ? "Correct! " : "Not quite. ";
    const resultExplanation = document.createElement("span");
    resultExplanation.textContent = isCorrect
        ? current.explanation
        : current.wrongReasons[index] || "That option does not match the concept being tested.";
    resultLine.append(resultLabel, resultExplanation);
    answerFeedback.appendChild(resultLine);

    if (!isCorrect) {
        const correctLine = document.createElement("p");
        correctLine.className = "feedback-explanation";
        const correctLabel = document.createElement("strong");
        correctLabel.textContent = `Correct answer: ${current.options[current.answer]}. `;
        const correctExplanation = document.createElement("span");
        correctExplanation.textContent = current.explanation;
        correctLine.append(correctLabel, correctExplanation);
        answerFeedback.appendChild(correctLine);
    }

    answerFeedback.classList.add(isCorrect ? "correct" : "wrong");

    window.setTimeout(() => {
        quizContainer.classList.add("question-exit");
        window.setTimeout(() => {
            if (currentQuestion === questions.length - 1) {
                showResult();
                return;
            }

            currentQuestion++;
            loadQuestion();
        }, 280);
    }, 3000);
}


/* =====================================================
   SHOW FINAL RESULT
===================================================== */

function showResult() {

    let correctAnswers = 0;

    answerFeedback.textContent = "";
    answerFeedback.classList.remove("correct", "wrong");


    /*
        Score is calculated ONLY
        after all 5 questions.
    */

    questions.forEach(
        (question, index) => {

            if (
                selectedAnswers[index] ===
                question.answer
            ) {

                correctAnswers++;

            }

        }
    );


    const wrongAnswers =
        questions.length -
        correctAnswers;


    const accuracy =
        Math.round(
            (correctAnswers /
                questions.length) * 100
        );


    /* ---------------------------------------------
       HIDE QUIZ
    --------------------------------------------- */

    quizContainer.style.display =
        "none";


    /* ---------------------------------------------
       SHOW RESULT
    --------------------------------------------- */

    resultElement.style.display =
        "block";


    /* ---------------------------------------------
       RESULT VALUES
    --------------------------------------------- */

    scoreElement.textContent =
        `${correctAnswers}/${questions.length}`;

    correctElement.textContent =
        correctAnswers;

    wrongElement.textContent =
        wrongAnswers;

    accuracyElement.textContent =
        `${accuracy}%`;


    /* ---------------------------------------------
       REVIEW SUMMARY
    --------------------------------------------- */

    resultSummary.innerHTML = "";

    questions.forEach((question, index) => {
        const selectedIndex =
            selectedAnswers[index];

        const isCorrect =
            selectedIndex === question.answer;

        const reviewItem =
            document.createElement("div");

        reviewItem.className = `review-item ${isCorrect ? "correct" : "wrong"}`;

        const correctText =
            question.options[question.answer];

        reviewItem.innerHTML = `
            <div class="review-top">
                <span>Q${index + 1}</span>
                <strong>${isCorrect ? "Correct" : "Wrong"}</strong>
            </div>
            <p>${question.question}</p>
            <small>Your answer: ${selectedIndex !== undefined ? question.options[selectedIndex] : "No answer"}</small>
            <small>Correct answer: ${correctText}</small>
        `;

        resultSummary.appendChild(reviewItem);
    });


    /* ---------------------------------------------
       SAVE HISTORY
    --------------------------------------------- */

    const questionReview = questions.map((question, index) => {
        const selectedIndex = selectedAnswers[index];

        return {
            question: question.question,
            topic: question.topic,
            userAnswer: selectedIndex !== undefined
                ? question.options[selectedIndex]
                : "Not answered",
            correctAnswer: question.options[question.answer],
            isCorrect: selectedIndex === question.answer
        };
    });

    savePracticeHistory(
        correctAnswers,
        wrongAnswers,
        accuracy,
        questionReview
    );

}


/* =====================================================
   RETRY
===================================================== */

retryButton.addEventListener(
    "click",
    () => {

        window.location.reload();

    }
);


/* =====================================================
   HINT
===================================================== */

hintButton.addEventListener(
    "click",
    () => {

        if (
            hintElement.classList.contains(
                "show"
            )
        ) {

            hintElement.classList.remove(
                "show"
            );

            hintButton.textContent =
                "💡 Show Hint";

        } else {

            const current =
                questions[currentQuestion];

            hintElement.textContent =
                getHint(current);

            hintElement.classList.add(
                "show"
            );

            hintButton.textContent =
                "💡 Hide Hint";

        }

    }
);


/* =====================================================
   SIMPLE HINT
===================================================== */

function getHint(question) {

    return "Think about the basic concept related to this question.";

}


/* =====================================================
   SAVE PRACTICE HISTORY
===================================================== */

function savePracticeHistory(
    correct,
    wrong,
    accuracy,
    questionReview
) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "practiceHistory"
            )
        ) || [];


    const record = {

        subject:
            subjectNames[selectedSubject],

        score:
            `${correct}/${questions.length}`,

        correct:
            correct,

        wrong:
            wrong,

        accuracy:
            accuracy,

        questions:
            questionReview,

        date:
            new Date().toLocaleDateString(),

        savedAt:
            new Date().toISOString()

    };


    history.unshift(record);


    localStorage.setItem(
        "practiceHistory",
        JSON.stringify(history)
    );

}


/* =====================================================
   START QUIZ
===================================================== */

loadQuestion();