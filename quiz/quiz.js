// Warte, bis das gesamte HTML-Dokument geladen ist
document.addEventListener('DOMContentLoaded', function () {

    // =======================================================
    // === JavaScript für das aufklappbare Menü ===
    // =======================================================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }


    // =======================================================
    // === Quiz-Logik ===
    // =======================================================
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const nextButton = document.getElementById('next-button');
    const questionArea = document.getElementById('question-area');
    const resultArea = document.getElementById('result-area');
    const scoreSpan = document.getElementById('score');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const restartButton = document.getElementById('restart-button');

    const progressText = document.getElementById('progress-text');
    const timerBarContainer = document.querySelector('.timer-bar-container');
    const timerBar = document.getElementById('timer-bar');

    const highscoreList = document.getElementById('highscore-list');

    const questions = [
        {
            question: "Was ist die Hauptstadt Japans?",
            options: ["Kyoto", "Osaka", "Tokyo", "Sapporo"],
            correctAnswer: "Tokyo"
        },
        {
            question: "Welcher Berg ist der höchste Berg Japans?",
            options: ["Mount Fuji", "Mount Kita", "Mount Yari", "Mount Tate"],
            correctAnswer: "Mount Fuji"
        },
        {
            question: "Wie nennt man die traditionelle japanische Teezeremonie?",
            options: ["Ikebana", "Origami", "Chanoyu", "Kabuki"],
            correctAnswer: "Chanoyu"
        },
        {
            question: "Welche Schrift verwendet Japan NICHT?",
            options: ["Hiragana", "Katakana", "Kanji", "Hangul"],
            correctAnswer: "Hangul"
        },
        {
            question: "Was bedeutet 'Sakura' auf Deutsch?",
            options: ["Kirschblüte", "Bambus", "Kiefer", "Lotus"],
            correctAnswer: "Kirschblüte"
        },
        {
            question: "Welches Gericht ist KEIN traditionelles japanisches Gericht?",
            options: ["Sushi", "Ramen", "Tempura", "Kimchi"],
            correctAnswer: "Kimchi"
        },
        {
            question: "Wie viele Inseln hat Japan ungefähr?",
            options: ["Etwa 1.000", "Etwa 3.000", "Etwa 7.000", "Etwa 10.000"],
            correctAnswer: "Etwa 7.000"
        },
        {
            question: "Welcher dieser Tempel befindet sich in Kyoto?",
            options: ["Senso-ji", "Kinkaku-ji", "Meiji-Schrein", "Todai-ji"],
            correctAnswer: "Kinkaku-ji"
        },
        {
            question: "Was ist ein 'Onsen'?",
            options: ["Eine heiße Quelle", "Ein Tempel", "Ein Theater", "Ein Markt"],
            correctAnswer: "Eine heiße Quelle"
        },
        {
            question: "Welcher Sport ist in Japan sehr beliebt und hat seinen Ursprung dort?",
            options: ["Baseball", "Fußball", "Sumo", "Basketball"],
            correctAnswer: "Sumo"
        }
    ];

    let shuffledQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedOptionButton = null;

    const TIME_PER_QUESTION = 15;
    let timerInterval = null;
    let timeLeft = TIME_PER_QUESTION;

    const HIGHSCORE_KEY = 'japanQuizHighscores';
    const MAX_HIGHSCORES = 5;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startTimer() {
        timeLeft = TIME_PER_QUESTION;
        timerBar.style.width = '100%';
        timerBar.style.transition = `width ${TIME_PER_QUESTION}s linear`;

        setTimeout(() => {
            timerBar.style.width = '0%';
        }, 50);

        timerInterval = setTimeout(() => {
            checkAnswer(null);
        }, TIME_PER_QUESTION * 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearTimeout(timerInterval);
            timerInterval = null;
        }
        timerBar.style.transition = 'none';
    }

    function resetTimer() {
        stopTimer();
        timerBar.style.width = '100%';
        timerBar.style.transition = 'none';
    }

    function loadHighscores() {
        const stored = localStorage.getItem(HIGHSCORE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    function saveHighscore(finalScore) {
        const highscores = loadHighscores();
        const userName = prompt('Gratulation! Gib deinen Namen für die Bestenliste ein:') || 'Anonym';

        highscores.push({
            name: userName,
            score: finalScore,
            date: new Date().toISOString()
        });

        highscores.sort((a, b) => b.score - a.score);
        const topScores = highscores.slice(0, MAX_HIGHSCORES);
        localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(topScores));

        displayHighscores();
    }

    function displayHighscores() {
        const highscores = loadHighscores();
        highscoreList.innerHTML = '';

        if (highscores.length === 0) {
            highscoreList.innerHTML = '<li>Noch keine Highscores vorhanden</li>';
            return;
        }

        highscores.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${index + 1}. ${entry.name}</span><span>${entry.score} Punkte</span>`;
            highscoreList.appendChild(li);
        });
    }

    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        shuffledQuestions = shuffleArray([...questions]);
        questionArea.classList.remove('hidden');
        resultArea.classList.add('hidden');
        nextButton.disabled = true;
        displayQuestion();
    }

    function displayQuestion() {
        resetTimer();
        selectedOptionButton = null;
        nextButton.disabled = true;

        const currentQuestion = shuffledQuestions[currentQuestionIndex];
        questionText.textContent = currentQuestion.question;
        optionsContainer.innerHTML = '';

        updateProgressText();

        const shuffledOptions = shuffleArray([...currentQuestion.options]);

        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.textContent = option;
            button.addEventListener('click', () => selectOption(button, option));
            optionsContainer.appendChild(button);
        });

        startTimer();
    }

    function selectOption(button, selectedAnswer) {
        if (selectedOptionButton) return;

        selectedOptionButton = button;
        stopTimer();

        button.classList.add('selected');
        checkAnswer(selectedAnswer);
    }

    function checkAnswer(selectedAnswer) {
        stopTimer();

        const currentQuestion = shuffledQuestions[currentQuestionIndex];
        const correctAnswer = currentQuestion.correctAnswer;

        const buttons = optionsContainer.querySelectorAll('.option-button');

        buttons.forEach(button => {
            button.disabled = true;

            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            } else if (button.textContent === selectedAnswer) {
                button.classList.add('wrong');
            }
        });

        if (selectedAnswer === correctAnswer) {
            score++;
        }

        nextButton.disabled = false;
    }

    function updateProgressText() {
        progressText.textContent = `Frage ${currentQuestionIndex + 1} von ${shuffledQuestions.length}`;
    }

    function showResult() {
        questionArea.classList.add('hidden');
        resultArea.classList.remove('hidden');
        scoreSpan.textContent = score;
        totalQuestionsSpan.textContent = shuffledQuestions.length;

        const percentage = (score / shuffledQuestions.length) * 100;
        if (percentage >= 70) {
            saveHighscore(score);
        }
    }

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;

        if (currentQuestionIndex < shuffledQuestions.length) {
            displayQuestion();
        } else {
            showResult();
        }
    });

    restartButton.addEventListener('click', startQuiz);

    startQuiz();
    displayHighscores();
});