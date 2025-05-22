const API_AMOUNT = 5;
const API_CATEGORY = null;
const API_TYPE = 'multiple';
const API_DIFFICULTY = null;

const questions = [];

const questionElement = document.getElementById("question");
const answerButtonsContainer = document.getElementById("answer-burrons");
const nextButton = document.getElementById("next-btn");
const scoreNumElement = document.querySelector(".score-num");
const answeredNumElement = document.querySelector(".answered-num");
const quizForm = document.getElementById("quiz_form");

let currentQuestionIndex = 0;
let score = 0;

async function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.textContent = "Enviar";
    nextButton.style.display = "block";

    nextButton.removeEventListener("click", startQuiz);
    nextButton.addEventListener("click", handleNextButton);

    updateScoreBoard();
    
    const questionsLoaded = await fetchQuestionsFromAPI();
    
    if (questionsLoaded && questions.length > 0) {
        showQuestion();
    } else {
        questionElement.innerHTML = `Não foi possível carregar as perguntas.<br>Por favor, verifique sua conexão ou tente novamente mais tarde.`;
        nextButton.style.display = "none";
    }
}

async function fetchQuestionsFromAPI() {
    try {
        let apiUrl = `https://tryvia.ptr.red/api.php?amount=${API_AMOUNT}`;

        if (API_CATEGORY !== null && API_CATEGORY !== 0) {
            apiUrl += `&category=${API_CATEGORY}`;
        }
        if (API_TYPE !== null && API_TYPE !== 0) {
            apiUrl += `&type=${API_TYPE}`;
        }
        if (API_DIFFICULTY !== null && API_DIFFICULTY !== 0) {
            apiUrl += `&difficulty=${API_DIFFICULTY}`;
        }

        console.log("URL da API sendo usada:", apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na resposta da API:", errorText);
            throw new Error(`Erro HTTP! Status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Dados recebidos da API:", data);

        const rawQuestions = data.results;

        if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
            throw new Error("A API retornou um formato inválido ou nenhum resultado válido na chave 'results'.");
        }

        const apiQuestions = rawQuestions.map(item => {
            const allAnswersText = [...item.incorrect_answers, item.correct_answer];
            
            allAnswersText.sort(() => Math.random() - 0.5);

            return {
                question: item.question,
                answers: allAnswersText.map((answerText, index) => ({
                    id: index + 1,
                    text: answerText,
                    correct: answerText === item.correct_answer
                }))
            };
        });

        questions.length = 0;
        questions.push(...apiQuestions);
        
        answeredNumElement.textContent = `${currentQuestionIndex}/${questions.length}`;

        return true;
    } catch (error) {
        console.error("Erro no processamento da API:", error);
        questionElement.innerHTML = `Erro ao carregar perguntas.<br>Verifique sua conexão ou tente novamente mais tarde.`;
        nextButton.style.display = "none";
        answeredNumElement.textContent = `0/0`;
        return false;
    }
}

function showQuestion() {
    const existingOptions = answerButtonsContainer.querySelectorAll(".option");
    existingOptions.forEach(option => option.remove());

    if (currentQuestionIndex >= questions.length) {
        showResult();
        return;
    }

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

    const radios = quizForm.elements.quiz;
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = false;
    }

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function updateScoreBoard() {
    scoreNumElement.textContent = score;
    answeredNumElement.textContent = `${currentQuestionIndex}/${questions.length}`;
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

startQuiz();