// quiz.js
import { quizQuestions } from './questions.js'; // Fragen importieren

// DOM-Elemente
const questionArea = document.getElementById('question-area');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-button');

const resultArea = document.getElementById('result-area');
const scoreDisplay = document.getElementById('score');
const totalQuestionsDisplay = document.getElementById('total-questions');
const restartButton = document.getElementById('restart-button');

// Quiz-Variablen
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null; // Speichert die vom Benutzer ausgewählte Option
let questionAnswered = false; // Verhindert mehrfaches Antworten pro Frage

// --- Funktionen ---

/**
 * Startet das Quiz oder setzt es zurück.
 */
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    selectedOption = null;
    questionAnswered = false;

    // UI zurücksetzen
    questionArea.classList.remove('hidden');
    resultArea.classList.add('hidden');
    nextButton.textContent = 'Nächste Frage'; // Text für den ersten Button-Zustand

    displayQuestion();
}

/**
 * Zeigt die aktuelle Frage und ihre Optionen an.
 */
function displayQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        showResult(); // Alle Fragen beantwortet, zeige Ergebnis an
        return;
    }

    const question = quizQuestions[currentQuestionIndex];
    questionText.textContent = question.question;
    optionsContainer.innerHTML = ''; // Vorherige Optionen löschen
    selectedOption = null; // Auswahl zurücksetzen
    questionAnswered = false; // Frage ist noch nicht beantwortet

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.classList.add('option-button');
        button.textContent = option;
        button.dataset.index = index; // Speichert den Index der Option
        button.addEventListener('click', () => selectOption(button, option));
        optionsContainer.appendChild(button);
    });

    // Button-Text aktualisieren, falls dies die letzte Frage ist
    if (currentQuestionIndex === quizQuestions.length - 1) {
        nextButton.textContent = 'Ergebnis anzeigen';
    } else {
        nextButton.textContent = 'Nächste Frage';
    }
}

/**
 * Behandelt die Auswahl einer Antwortoption.
 * @param {HTMLButtonElement} button Das geklickte Button-Element.
 * @param {string} optionText Der Text der ausgewählten Option.
 */
function selectOption(button, optionText) {
    if (questionAnswered) return; // Wenn Frage schon beantwortet, nichts tun

    // Alle Buttons deselektieren
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.classList.remove('selected');
        btn.classList.remove('correct');
        btn.classList.remove('wrong');
    });

    // Ausgewählten Button markieren
    button.classList.add('selected');
    selectedOption = optionText;
}

/**
 * Überprüft die ausgewählte Antwort und geht zur nächsten Frage oder zum Ergebnis.
 */
function checkAnswerAndProceed() {
    if (selectedOption === null && !questionAnswered) {
        alert('Bitte wähle eine Antwort aus!');
        return;
    }

    if (!questionAnswered) { // Nur bewerten, wenn noch nicht bewertet
        const question = quizQuestions[currentQuestionIndex];
        const isCorrect = (selectedOption === question.correctAnswer);

        if (isCorrect) {
            score++;
        }

        // Visuelles Feedback geben
        document.querySelectorAll('.option-button').forEach(btn => {
            if (btn.textContent === question.correctAnswer) {
                btn.classList.add('correct'); // Richtige Antwort grün
            } else if (btn.textContent === selectedOption && !isCorrect) {
                btn.classList.add('wrong'); // Falsch ausgewählte Antwort rot
            }
            btn.disabled = true; // Buttons deaktivieren, um weitere Klicks zu verhindern
        });
        questionAnswered = true; // Frage wurde bewertet
        nextButton.textContent = 'Weiter'; // Ändere den Text des Buttons
    } else {
        // Wenn die Frage bereits bewertet wurde, gehe zur nächsten
        currentQuestionIndex++;
        displayQuestion();
    }
}


/**
 * Zeigt das Endergebnis des Quiz an.
 */
function showResult() {
    questionArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    scoreDisplay.textContent = score;
    totalQuestionsDisplay.textContent = quizQuestions.length;
}

// --- Event Listener ---

document.addEventListener('DOMContentLoaded', startQuiz); // Quiz starten, wenn DOM geladen

nextButton.addEventListener('click', checkAnswerAndProceed);
restartButton.addEventListener('click', startQuiz);