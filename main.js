const form = document.getElementById('form');
const start_page = document.getElementById('start-page');
const play_page = document.getElementById('play-page');
const result_page = document.getElementById('result-page');
const body = document.querySelector('body');

const submit_button = document.getElementById('submit-answer');
const progress_num = document.getElementById('progress-num');
const question = document.getElementById('question');
const options = form.querySelectorAll('.answer-text');
const play_again = document.getElementById('play-again');
const labels = Array.from(form.querySelectorAll('label'));
const score_area = result_page.querySelector('.score');
const progress_bar = document.querySelector('progress');
const category_areas = Array.from(document.querySelectorAll('.category-area'));
const theme_switch = document.getElementById('theme-checkbox');

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

const clearCategoryAreas = () => {
    for(let area of category_areas) {
        let icon = area.querySelector('.category-icon'); 
        icon.classList = []; //clear the classes
        icon.classList.add('category-icon');
        area.querySelector('.category-name').innerText = '';    
    }
}
const setCategoryAreas = (category) => {
    for(let area of category_areas) {
        let icon = area.querySelector('.category-icon'); 
        icon.classList = []; //clear the classes
        icon.classList.add('category-icon');
        icon.classList.add(category.toLowerCase() + '-icon');
        area.querySelector('.category-name').innerText = category;
    }
}

const initialize_quiz = (category) => {
    reset_counters();
    for(let i=0; i<Qset.quizzes.length; ++i) {
        if(category == Qset.quizzes[i].title) {
            category_idx = i;
            break;
        }
    }
    setCategoryAreas(category);
}

//get a question at IDX for the currently selected category
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
    progress_bar.value = 0;

    clearCategoryAreas();
}
const show_play_page = () => {
    start_page.classList.add('hidden');
    play_page.classList.remove('hidden');
    result_page.classList.add('hidden');
}
const show_result_page = () => {
    start_page.classList.add('hidden');
    play_page.classList.add('hidden');
    result_page.classList.remove('hidden');
}

const populate_question = () => {
    for(let label of labels) {
        label.classList.remove('chosen');
        label.classList.remove('correct');
        label.classList.remove('incorrect');
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
    //console.log('choice-idx:', choice_idx, 'answer-idx:', answer_idx);
    if(answer_idx == choice_idx) { //answered correctly
        labels[answer_idx].classList.add('correct');
        num_correct ++;
    } else { //answered incorrectly
        labels[answer_idx].classList.add('correct');
        labels[choice_idx].classList.add('incorrect');
    }
    submit_button.innerText = 'Next Question';
}

const populate_result = () => {
    score_area.innerText = num_correct;
}

form.addEventListener('submit', (e) => {
    //console.log('submit', e);
    submit_button.blur();
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
        if(!data['answer']) { //no selection was made
            form.classList.add('invalid');
            e.preventDefault();
            return false;
        } else {
            populate_answer(current_question, data['answer']);
            progress_bar.value = question_idx;
        }
    }
    answer_revealed = !answer_revealed; //toggle the boolean
    e.preventDefault();
});

//start the game
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

//choose an answer
form.querySelectorAll('input[type="radio"]').forEach(elm => {
    console.log('select', elm);
    elm.addEventListener('change', ()=> {
        console.log('change', elm);
        labels.forEach(label => {
            label.classList.remove('chosen');
        });
        elm.parentNode.classList.add('chosen');
        form.classList.remove('invalid'); //clear the error-message
    });
});

//play again button
play_again.addEventListener('click', ()=> {
    show_initial_page();
});

//theme switch 
theme_switch.addEventListener('click', () => {
    if(body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
});
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    if(savedTheme === 'light') {
        theme_switch.checked = false;
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        theme_switch.checked = true;
    }
}

//initialize views
show_initial_page();


