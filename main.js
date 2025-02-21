const form = document.getElementById('form');
const submit_button = form.querySelector('button[type="submit"]')
const start_page = document.getElementById('start-page');
const play_page = document.getElementById('play-page');
const result_page = document.getElementById('result-page');

const progress_num = document.getElementById('progress-num');
const question = document.getElementById('question');
const options = form.querySelectorAll('.answer-text');
const play_again = document.getElementById('play-again');
const labels = Array.from(form.querySelectorAll('label'));
const score_area = result_page.querySelector('.score');

let Qset; //all the questions 
let current_question;
let category_idx;
let question_idx;
let num_correct;
let answer_revealed;

// fetch the JSON data
fetch('data.json').then((response) => {
    if(!response.ok) return console.log('Oops! Something went wrong.');
  
    return response.json();
  }).then((data) => {
    Qset = data;
    console.log(Qset);
  });

const reset_counters = () => {
    current_question = null;
    category_idx = -1;
    question_idx= 0;
    num_correct = 0;
    answer_revealed = false;
}

const initialize_quiz = (category) => {
    reset_counters();
    for(let i=0; i<Qset.quizzes.length; ++i) {
        if(category == Qset.quizzes[i].title) {
            category_idx = i;
            break;
        }
    }
}

//set the current_question. set it to null if reached the end
const fetchQuestion = (idx) => {
    let q = null;
    if(category_idx >= 0 && idx < Qset.quizzes[category_idx].questions.length) {
        q = Qset.quizzes[category_idx].questions[idx];
    } 
    return q;
}

//map the answer field of the question to its index in the options array
const correctAnswerIndex = (q) => {
    for(let i=0; i< q.options.length; i++) {
        if(q.answer == q.options[i]) {
            return i;
        }
    }
    return undefined;
}

//return true if we reached the end of the questionair
const quizz_ended = () => {
    return question_idx >= Qset.quizzes[category_idx].questions.length;
}

const show_initial_page = () => {
    start_page.classList.remove('hidden');
    play_page.classList.add('hidden');
    result_page.classList.add('hidden');
}
const show_play_page = () => {
    start_page.classList.add('hidden');
    play_page.classList.remove('hidden');
}
const show_result_page = () => {
    play_page.classList.add('hidden');
    result_page.classList.remove('hidden');
}

const populate_question = () => {
    for(let label of labels) {
        label.classList.remove('correct');
        label.classList.remove('chosen');
    }
    question.innerText = current_question.question;
    for(let i=0; i<options.length; ++i) {
        options[i].innerText = current_question.options[i];
    }
    progress_num.innerText = '' + question_idx;
    submit_button.innerText = 'Submit Answer';
}

const populate_answer = (q, choice) => {
    let choice_idx = choice.charCodeAt(0) - 'A'.charCodeAt(0);
    let answer_idx = correctAnswerIndex(q);
    console.log('choice-idx:', choice_idx, 'answer-idx:', answer_idx);
    if(answer_idx == choice_idx) { //answered correctly
        labels[answer_idx].classList.add('correct');
        num_correct ++;
    } else { //answered incorrectly
        labels[answer_idx].classList.add('correct');
        labels[choice_idx].classList.add('chosen');
    }
    submit_button.innerText = 'Next Question';
}

const populate_result = () => {
    score_area.innerText = num_correct;
}

form.addEventListener('submit', (e) => {
    //console.log('submit', e);
    if(answer_revealed) {
        if(quizz_ended()) { //reached the end
            populate_result();
            show_result_page();
        } else {
            current_question = fetchQuestion(question_idx);
            question_idx++;
            populate_question();
        }
        form.reset();
    } else {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        populate_answer(current_question, data['answer']);
    }
    answer_revealed = !answer_revealed; //toggle the boolean
    e.preventDefault();
});

document.querySelectorAll('#start-page button').forEach((elm)=> {
    //console.log(elm);
    elm.addEventListener('click', ()=> {
        console.log(elm);
        initialize_quiz(elm.innerText);
        current_question = fetchQuestion(0);
        question_idx++;
        populate_question();
        show_play_page();
    });
});

play_again.addEventListener('click', ()=> {
    show_initial_page();
})

//initialize views
show_initial_page();


