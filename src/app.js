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

// Seleção dos elementos HTML
const questionElement = document.getElementById("question");
const answerButtonsContainer = document.getElementById("answer-burrons"); // O container das opções e do botão
const nextButton = document.getElementById("next-btn");
const scoreNumElement = document.querySelector(".score-num");
const answeredNumElement = document.querySelector(".answered-num");
const quizForm = document.getElementById("quiz_form");

let currentQuestionIndex = 0;
let score = 0;

// Função para iniciar ou reiniciar o quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.textContent = "Enviar"; // Volta o texto do botão para "Enviar"
    nextButton.style.display = "block"; // Garante que o botão esteja visível
    
    // Remove qualquer listener anterior que possa ter sido adicionado para 'Jogar Novamente'
    nextButton.removeEventListener("click", startQuiz); 
    // Adiciona o listener padrão para avançar as questões
    nextButton.addEventListener("click", handleNextButton);

    updateScoreBoard();
    showQuestion();
}

// Função para exibir a pergunta e suas opções
function showQuestion() {
    // Primeiro, limpa todas as opções dinamicamente criadas
    // Percorre de trás para frente para evitar problemas de índice ao remover
    const existingOptions = answerButtonsContainer.querySelectorAll(".option");
    existingOptions.forEach(option => option.remove());

    const currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

    // Cria e adiciona as novas opções de rádio
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
        
        // Insere a nova opção ANTES do div.buttons que já existe no HTML
        // Isso garante que as opções fiquem acima do botão.
        const buttonsDiv = answerButtonsContainer.querySelector('.buttons');
        if (buttonsDiv) {
            answerButtonsContainer.insertBefore(optionDiv, buttonsDiv);
        } else {
            // Caso por algum motivo o div.buttons não seja encontrado, adiciona ao final
            answerButtonsContainer.appendChild(optionDiv);
        }
    });
}

// Função para lidar com o clique/submissão do botão "Enviar" ou "Próximo"
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
        // Desmarca as opções de rádio para a próxima pergunta
        const radios = quizForm.elements.quiz;
        for (let i = 0; i < radios.length; i++) {
            radios[i].checked = false;
        }
        showQuestion(); // Exibe a próxima pergunta
    } else {
        showResult(); // Exibe o resultado final
    }
}

// Função para atualizar o placar
function updateScoreBoard() {
    scoreNumElement.textContent = score;
    answeredNumElement.textContent = currentQuestionIndex; // Mostra quantas questões já foram respondidas
}

// Função para exibir o resultado final do quiz
function showResult() {
    // Remove apenas as divs de opção, mantendo a div de botões e o próprio botão
    const existingOptions = answerButtonsContainer.querySelectorAll(".option");
    existingOptions.forEach(option => option.remove());

    // Dentro da função showResult()
    questionElement.innerHTML = `Quiz Finalizado!<br>Você acertou ${score} de ${questions.length} questões.`;
    nextButton.textContent = "Jogar Novamente";
    
    // Remove o listener de handleNextButton e adiciona o de startQuiz
    nextButton.removeEventListener("click", handleNextButton);
    nextButton.addEventListener("click", startQuiz);
}

// Event Listener para o formulário (preferível para inputs de rádio)
// Usa 'submit' para que a validação de "selecionar uma opção" seja mais robusta
quizForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página
    // handleNextButton é chamado pelo listener do botão, então não precisamos dele aqui
    // Apenas garantimos que o formulário não recarregue a página
});

// Adiciona o listener de clique ao botão principal. 
// Ele será reatribuído em 'startQuiz' ou 'showResult' conforme a necessidade.
nextButton.addEventListener("click", handleNextButton);


// Inicia o quiz quando a página carrega
startQuiz();