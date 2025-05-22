// --- Configurações da API ---
const API_AMOUNT = 5; // Quantidade de perguntas (entre 1 e 50, recomendo não exagerar para evitar problemas de carregamento)
const API_CATEGORY = null; // null ou 0 para qualquer categoria, ou o ID de uma categoria (ex: 1 para Conhecimentos Gerais)
const API_TYPE = 'multiple'; // 'multiple' para múltipla escolha, 'boolean' para verdadeiro/falso, ou null/0 para qualquer tipo
const API_DIFFICULTY = null; // 'easy', 'medium', 'hard', ou null/0 para qualquer dificuldade
// const API_TOKEN = null; // A Tryvia API geralmente não requer token para uso básico. Se tiver um, coloque aqui.
// --- Fim das Configurações ---


const questions = []; // O array de questões agora será preenchido pela API

// Seleção dos elementos HTML
const questionElement = document.getElementById("question");
const answerButtonsContainer = document.getElementById("answer-burrons"); // O container das opções e do botão
const nextButton = document.getElementById("next-btn");
const scoreNumElement = document.querySelector(".score-num");
const answeredNumElement = document.querySelector(".answered-num");
const quizForm = document.getElementById("quiz_form");

let currentQuestionIndex = 0;
let score = 0;

// --- Funções do Quiz ---

// Função para iniciar ou reiniciar o quiz
async function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.textContent = "Enviar";
    nextButton.style.display = "block";

    nextButton.removeEventListener("click", startQuiz);
    nextButton.addEventListener("click", handleNextButton);

    updateScoreBoard(); // Atualiza o placar inicial (0/X)
    
    // Tenta buscar as perguntas
    const questionsLoaded = await fetchQuestionsFromAPI(); 
    
    // Só mostra a pergunta se realmente existirem perguntas carregadas
    if (questionsLoaded && questions.length > 0) {
        showQuestion();
    } else {
        // Se não houver perguntas, pode ser um erro ou a API não retornou nada
        questionElement.innerHTML = `Não foi possível carregar as perguntas.<br>Por favor, verifique sua conexão ou tente novamente mais tarde.`;
        nextButton.style.display = "none";
    }
}

// Função para buscar questões da Tryvia API usando os parâmetros configurados
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
        // if (API_TOKEN !== null) { // Descomente se for usar token
        //     apiUrl += `&token=${API_TOKEN}`;
        // }

        console.log("URL da API sendo usada:", apiUrl); // Para depuração

        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na resposta da API:", errorText); // Loga o texto de erro da API
            throw new Error(`Erro HTTP! Status: ${response.status} - ${errorText}`);
        }

        const data = await response.json(); // Aqui 'data' é o objeto {response_code: 0, results: Array(5)}
        console.log("Dados recebidos da API:", data); // Inspecione 'data' no console!

        // **CORREÇÃO PRINCIPAL AQUI:**
        // Acessa o array de perguntas através da chave 'results'
        const rawQuestions = data.results; 

        if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
            throw new Error("A API retornou um formato inválido ou nenhum resultado válido na chave 'results'.");
        }

        const apiQuestions = rawQuestions.map(item => { // Agora mapeamos 'item' de 'rawQuestions'
            // A Tryvia API retorna as respostas no formato:
            // incorrect_answers: ["Resp. Incorreta 1", "Resp. Incorreta 2", ...]
            // correct_answer: "Resp. Correta"
            // Precisamos combinar e embaralhar para o seu formato.

            // Combina respostas incorretas e a correta
            const allAnswersText = [...item.incorrect_answers, item.correct_answer];
            
            // Embaralha as respostas para que a correta não esteja sempre na mesma posição
            // Isso é crucial para um quiz justo.
            allAnswersText.sort(() => Math.random() - 0.5); 

            return {
                question: item.question,
                answers: allAnswersText.map((answerText, index) => ({
                    id: index + 1, // Atribui um ID único para cada opção (1, 2, 3, 4)
                    text: answerText,
                    correct: answerText === item.correct_answer // Verifica se é a resposta correta
                }))
            };
        });

        questions.length = 0; // Limpa o array existente
        questions.push(...apiQuestions); // Adiciona as novas perguntas
        
        // Atualiza o total de perguntas no placar assim que as perguntas são carregadas
        answeredNumElement.textContent = `${currentQuestionIndex}/${questions.length}`;

        return true; // Indica sucesso
    } catch (error) {
        console.error("Erro no processamento da API:", error); // Loga o erro detalhado
        questionElement.innerHTML = `Erro ao carregar perguntas.<br>Verifique sua conexão ou tente novamente mais tarde.`;
        nextButton.style.display = "none";
        answeredNumElement.textContent = `0/0`; 
        return false; // Indica falha
    }
}


// Função para exibir a pergunta e suas opções (NÃO ALTERADA)
function showQuestion() {
    const existingOptions = answerButtonsContainer.querySelectorAll(".option");
    existingOptions.forEach(option => option.remove());

    if (currentQuestionIndex >= questions.length) {
        showResult();
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    // A função unescapeHtml pode ser necessária se a API retornar entidades HTML codificadas
    // questionElement.textContent = `${currentQuestionIndex + 1}. ${unescapeHtml(currentQuestion.question)}`;
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
        // A função unescapeHtml pode ser necessária para as respostas também
        // label.textContent = unescapeHtml(answer.text);
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

// Funções handleNextButton, updateScoreBoard e showResult (NÃO ALTERADAS, exceto pequenas otimizações)
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

    // Desmarca as opções de rádio para a próxima pergunta
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
    // Garante que o total reflita o número de perguntas carregadas
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

// --- Início do Quiz ---
startQuiz();

/*
// Função auxiliar para decodificar entidades HTML (se necessário)
// Algumas APIs podem retornar strings com &amp;, &quot;, etc.
function unescapeHtml(text) {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.documentElement.textContent;
}
*/