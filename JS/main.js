
const sideNav = document.getElementById('sideNav');
const openCloseIcon = document.getElementById('openCloseIcon');
const mealsSection = document.getElementById('mealsSection');
const contentGrid = document.getElementById('contentGrid');
const detailsSection = document.getElementById('detailsSection');
const submitBtn = document.getElementById('submitBtn');
const navLinks = document.querySelectorAll('.nav-links a');


const sections = ['mealsSection', 'searchSection', 'contentGrid', 'detailsSection', 'contactSection'];

function showSection(idToShow) {
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.classList.add('d-none'); 
        }
    });

    const targetSection = document.getElementById(idToShow);
    if (targetSection) {
        targetSection.classList.remove('d-none'); 
    }

    if (idToShow === 'contentGrid' || idToShow === 'mealsSection') {
        if (targetSection) targetSection.innerHTML = '';
    }
}


openCloseIcon.addEventListener('click', function() {
    sideNav.classList.toggle('open');
    if (sideNav.classList.contains('open')) {
        this.classList.remove('fa-bars');
        this.classList.add('fa-times');
    } else {
        this.classList.remove('fa-times');
        this.classList.add('fa-bars');
    }
});


navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const sectionName = this.getAttribute('data-section');
        const sectionId = sectionName + 'Section';

        
        openCloseIcon.click(); 

        
        showSection(sectionId);

        if (sectionName === 'categories') {
            fetchCategories();
        } else if (sectionName === 'area') {
            fetchAreas();
        } else if (sectionName === 'ingredients') {
            fetchIngredients();
        }
    });
});



async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.meals || data.categories || data.areas || data.ingredients || []; 
        
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}
async function getInitialMeals() {
    const meals = await fetchData(`https://www.themealdb.com/api/json/v1/1/search.php?s=`);
    displayMeals(meals.slice(0, 20));
}

function displayMeals(meals) {
    showSection('mealsSection');
    let htmlContent = '';
    
    if (!meals || meals.length === 0) {
        mealsSection.innerHTML = '<div class="col-12 text-center text-white">No meals found.</div>';
        return;
    }

    meals.forEach(meal => {
        htmlContent += `
            <div class="col-md-3 meal-card" data-id="${meal.idMeal}">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="overlay d-flex justify-content-center align-items-center">
                    <h3>${meal.strMeal}</h3>
                </div>
            </div>
        `;
    });
    mealsSection.innerHTML = htmlContent;
}


mealsSection.addEventListener('click', async function(e) {

    const mealCard = e.target.closest('.meal-card');
    if (mealCard) {
        const mealId = mealCard.getAttribute('data-id');
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
        const details = await fetchData(url);
        if (details.length > 0) {
            displayDetails(details[0]);
        }
    }
});

function displayDetails(meal) {
    showSection('detailsSection');
    
    let ingredientsList = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
            ingredientsList += `<li class="list-group-item bg-transparent text-white border-0 py-1">${measure} ${ingredient}</li>`;
        }
    }

    const tags = meal.strTags ? meal.strTags.split(',') : [];
    let tagsHtml = tags.map(tag => `<span class="badge rounded-pill">${tag.trim()}</span>`).join('');

    const htmlContent = `
        <div class="col-md-4 text-center">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-100 rounded">
            <h2 class="mt-3">${meal.strMeal}</h2>
        </div>
        <div class="col-md-8">
            <h3 class="mb-3">Instructions</h3>
            <p class="instruction-text">${meal.strInstructions}</p>
            <h4 class="mb-3">Area: <span>${meal.strArea}</span></h4>
            <h4 class="mb-3">Category: <span>${meal.strCategory}</span></h4>
            <h4 class="mb-3">Recipes:</h4>
            <ul class="list-group mb-4">
                ${ingredientsList}
            </ul>
            <h4 class="mb-3">Tags:</h4>
            <p class="mb-4">${tagsHtml || 'No tags'}</p>
            <a href="${meal.strSource}" target="_blank" class="btn btn-success me-2">Source</a>
            <a href="${meal.strYoutube}" target="_blank" class="btn btn-danger">YouTube</a>
        </div>
    `;
    detailsSection.innerHTML = htmlContent;
}

const searchInputName = document.getElementById('searchInputName');
const searchInputLetter = document.getElementById('searchInputLetter');
const searchSection = document.getElementById('searchSection'); 

function showSearchInterface() {
    
    searchSection.classList.remove('d-none'); 
    
    mealsSection.classList.remove('d-none');
    
    sections.forEach(id => {
        if (id !== 'searchSection' && id !== 'mealsSection') {
            document.getElementById(id).classList.add('d-none');
        }
    });
    
    mealsSection.innerHTML = '';
}


searchInputName.addEventListener('keyup', async function() {
    const query = this.value;
    
    showSearchInterface(); 
    
    if (query.length > 0) {
        const meals = await fetchData(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        displayMealsOnly(meals.slice(0, 20)); 
    } else {
        getInitialMeals(); 
    }
});

searchInputLetter.addEventListener('keyup', async function() {
    const query = this.value;
    
    showSearchInterface(); 
    
    if (query.length === 1) {
        const meals = await fetchData(`https://www.themealdb.com/api/json/v1/1/search.php?f=${query}`);
        displayMealsOnly(meals.slice(0, 20)); 
    } else {
        getInitialMeals();
    }
});



function displayMealsOnly(meals) {
    let htmlContent = '';
    mealsSection.innerHTML = ''; 

    if (!meals || meals.length === 0) {
        mealsSection.innerHTML = '<div class="col-12 text-center text-white">No meals found.</div>';
        return;
    }

    meals.forEach(meal => {
        htmlContent += `
            <div class="col-md-3 meal-card" data-id="${meal.idMeal}">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="overlay d-flex justify-content-center align-items-center">
                    <h3>${meal.strMeal}</h3>
                </div>
            </div>
        `;
    });
    mealsSection.innerHTML = htmlContent;
}


async function fetchCategories() {

    const data = await fetchData(`https://www.themealdb.com/api/json/v1/1/categories.php`);
    const categories = data; 

    showSection('contentGrid');
    let htmlContent = '';
    categories.slice(0, 20).forEach(cat => {
        htmlContent += `
            <div class="col-md-3 category-card" data-filter-type="c" data-filter-value="${cat.strCategory}">
                <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}">
                <div class="overlay flex-column p-2">
                    <h3 class="text-center">${cat.strCategory}</h3>
                    <p class="text-center text-black">${cat.strCategoryDescription.substring(0, 80)}...</p>
                </div>
            </div>
        `;
    });
    
    contentGrid.innerHTML = htmlContent;
}
async function fetchAreas() {
    const areas = await fetchData(`https://www.themealdb.com/api/json/v1/1/list.php?a=list`);
    showSection('contentGrid');
    let htmlContent = '';
    areas.slice(0, 20).forEach(area => {
        htmlContent += `
            <div class="col-md-3 category-card text-center" data-filter-type="a" data-filter-value="${area.strArea}">
                <i class="fas fa-city fa-5x text-white-50"></i>
                <h3 class="mt-3">${area.strArea}</h3>
            </div>
        `;
    });
    contentGrid.innerHTML = htmlContent;
}

async function fetchIngredients() {
    const ingredients = await fetchData(`https://www.themealdb.com/api/json/v1/1/list.php?i=list`);
    showSection('contentGrid');
    let htmlContent = '';
    ingredients.slice(0, 20).forEach(ing => {
        htmlContent += `
            <div class="col-md-3 category-card text-center" data-filter-type="i" data-filter-value="${ing.strIngredient}">
                <i class="fas fa-bowl-food fa-5x text-white-50"></i>
                <h3 class="mt-3">${ing.strIngredient}</h3>
                <p>${ing.strDescription ? ing.strDescription.substring(0, 80) : ''}...</p>
            </div>
        `;
    });
    contentGrid.innerHTML = htmlContent;
}



contentGrid.addEventListener('click', async function(e) {
    const categoryCard = e.target.closest('.category-card');
    if (categoryCard) {
        const filterType = categoryCard.getAttribute('data-filter-type'); 
        const filterValue = categoryCard.getAttribute('data-filter-value');
        
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?${filterType}=${filterValue}`;
        const meals = await fetchData(url);
        
        displayMeals(meals.slice(0, 20)); 
    }
});



const regex = {
    name: /^[a-zA-Z\s]{3,}$/, 
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\+?\d{10,14}$/,
    age: /^(?:[1-9]|[1-9][0-9]|100)$/,
    password: /^(?=.[A-Za-z])(?=.\d)[A-Za-z\d]{8,}$/,
};

const inputElements = {
    name: document.getElementById('nameInput'),
    email: document.getElementById('emailInput'),
    phone: document.getElementById('phoneInput'),
    age: document.getElementById('ageInput'),
    password: document.getElementById('passwordInput'),
    repassword: document.getElementById('repasswordInput'),
};



function validateInput(inputElement, pattern) {
    const value = inputElement.value;
    const isValid = pattern.test(value);

    
    if (isValid) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
    } else {
        if (value.length > 0) {
            inputElement.classList.remove('is-valid');
            inputElement.classList.add('is-invalid');
        } else {
            inputElement.classList.remove('is-valid', 'is-invalid');
        }
    }
    return isValid;
}


function checkAllInputs() {
    const isNameValid = validateInput(inputElements.name, regex.name);
    const isEmailValid = validateInput(inputElements.email, regex.email);
    const isPhoneValid = validateInput(inputElements.phone, regex.phone);
    const isAgeValid = validateInput(inputElements.age, regex.age);
    const isPasswordValid = validateInput(inputElements.password, regex.password);

    
    const isRepasswordMatch = inputElements.password.value === inputElements.repassword.value && inputElements.repassword.value.length > 0;
    

    if (isRepasswordMatch) {
        inputElements.repassword.classList.remove('is-invalid');
        inputElements.repassword.classList.add('is-valid');
    } else {
         if (inputElements.repassword.value.length > 0) {
            inputElements.repassword.classList.remove('is-valid');
            inputElements.repassword.classList.add('is-invalid');
        } else {
             inputElements.repassword.classList.remove('is-valid', 'is-invalid');
        }
    }


    if (isNameValid && isEmailValid && isPhoneValid && isAgeValid && isPasswordValid && isRepasswordMatch) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

Object.values(inputElements).forEach(input => {
    input.addEventListener('keyup', checkAllInputs);
});

document.addEventListener('DOMContentLoaded', function() {
    
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.classList.add('d-none');
    });
    getInitialMeals();
});
