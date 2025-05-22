const questions = [
    {
        question: "Qual o maior animal do mundo?",
        answers: [
            { id: 1, text: "Tubarao", correct: false },
            { id: 2, text: "Baleia Azul", correct: true },
            { id: 3, text: "Elefante Africano", correct: false },
            { id: 4, text: "Girafa", correct: false },
        ]
    },
    {
        question: "Qual o menor pais do mundo?",
        answers: [
            { id: 1, text: "Nauru", correct: false },
            { id: 2, text: "Monaco", correct: false },
            { id: 3, text: "Vaticano", correct: true },
            { id: 4, text: "Malta", correct: false },
        ]
    },
    {
        question: "Qual o metal mais abundante na crosta terrestre?",
        answers: [
            { id: 1, text: "Ferro", correct: false },
            { id: 2, text: "Cobre", correct: false },
            { id: 3, text: "Alumínio", correct: true },
            { id: 4, text: "Ouro", correct: false }
        ]
    },
    {
        question: "Quem pintou a 'Mona Lisa'?",
        answers: [
            { id: 1, text: "Vincent van Gogh", correct: false },
            { id: 2, text: "Pablo Picasso", correct: false },
            { id: 3, text: "Leonardo da Vinci", correct: true },
            { id: 4, text: "Michelangelo", correct: false }
        ]
    },
    {
        question: "Qual o planeta mais próximo do Sol?",
        answers: [
            { id: 1, text: "Vênus", correct: false },
            { id: 2, text: "Marte", correct: false },
            { id: 3, text: "Júpiter", correct: false },
            { id: 4, text: "Mercúrio", correct: true }
        ]
    }
];

const questionElement = document.getElementById("question");
const answerButtonsContainer = document.getElementById("answer-burrons");
const nextButton = document.getElementById("next-btn");
const scoreNumElement = document.querySelector(".score-num");
const answeredNumElement = document.querySelector(".answered-num");
const quizForm = document.getElementById("quiz_form");

let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.textContent = "Enviar"; 
    nextButton.style.display = "block"; 
    
    nextButton.removeEventListener("click", startQuiz); 
    nextButton.addEventListener("click", handleNextButton);

    updateScoreBoard();
    showQuestion();
}

function showQuestion() {
    const existingOptions = answerButtonsContainer.querySelectorAll(".option");
    existingOptions.forEach(option => option.remove());

    const currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

    currentQuestion.answers.forEach(answer => {
        const optionDiv = document.createElement("div");
        optionDiv.classList.add("option");

        const inputRadio = document.createElement("input");
        inputRadio.type = "radio";
        inputRadio.id = `option${answer.id}`;
        inputRadio.name = "quiz";
        inputRadio.value = answer.id;
        inputRadio.dataset.correct = answer.correct;

        const label = document.createElement("label");
        label.htmlFor = `option${answer.id}`;
        label.textContent = answer.text;

        optionDiv.appendChild(inputRadio);
        optionDiv.appendChild(label);
        
        const buttonsDiv = answerButtonsContainer.querySelector('.buttons');
        if (buttonsDiv) {
            answerButtonsContainer.insertBefore(optionDiv, buttonsDiv);
        } else {
            // Caso por algum motivo o div.buttons não seja encontrado, adiciona ao final
            answerButtonsContainer.appendChild(optionDiv);
        }
    });
}

function handleNextButton() {
    const selectedOption = document.querySelector('input[name="quiz"]:checked');

    if (!selectedOption) {
        alert("Por favor, selecione uma opção antes de enviar.");
        return;
    }

    const isCorrect = selectedOption.dataset.correct === "true";

    if (isCorrect) {
        score++;
    }

    currentQuestionIndex++;
    updateScoreBoard();

    if (currentQuestionIndex < questions.length) {
        const radios = quizForm.elements.quiz;
        for (let i = 0; i < radios.length; i++) {
            radios[i].checked = false;
        }
        showQuestion();
    } else {
        showResult();
    }
}

// Função para atualizar o placar
function updateScoreBoard() {
    scoreNumElement.textContent = score;
    answeredNumElement.textContent = currentQuestionIndex;
}

function showResult() {
    const existingOptions = answerButtonsContainer.querySelectorAll(".option");
    existingOptions.forEach(option => option.remove());

    questionElement.innerHTML = `Quiz Finalizado!<br>Você acertou ${score} de ${questions.length} questões.`;
    nextButton.textContent = "Jogar Novamente";
    
    nextButton.removeEventListener("click", handleNextButton);
    nextButton.addEventListener("click", startQuiz);
}

quizForm.addEventListener("submit", (e) => {
    e.preventDefault(); 
});

nextButton.addEventListener("click", handleNextButton);

startQuiz();