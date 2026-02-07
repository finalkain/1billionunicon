
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const themeSwitcher = document.querySelector('.theme-switcher svg');
    const settingsBtn = document.getElementById('settings-btn');
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.querySelector('.close-btn');
    const userInfoForm = document.getElementById('user-info-form');
    const foodInput = document.getElementById('food-input');
    const addFoodBtn = document.getElementById('add-food-btn');
    const foodList = document.getElementById('food-list');
    const resultBtn = document.getElementById('result-btn');
    const resultText = document.getElementById('result-text');

    // --- App State ---
    let userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    let todaysMeals = JSON.parse(localStorage.getItem('todaysMeals')) || [];

    // --- Simplified Food Data (per 100g) ---
    // In a real app, this would come from a database/API
    const foodData = {
        '사과': { calories: 52, carbs: 14, protein: 0.3, fat: 0.2 },
        '닭가슴살': { calories: 165, carbs: 0, protein: 31, fat: 3.6 },
        '계란': { calories: 155, carbs: 1.1, protein: 13, fat: 11 },
        '밥': { calories: 130, carbs: 28, protein: 2.7, fat: 0.3 },
        '바나나': { calories: 89, carbs: 23, protein: 1.1, fat: 0.3 },
        '아몬드': { calories: 579, carbs: 22, protein: 21, fat: 49 },
        '고구마': { calories: 86, carbs: 20, protein: 1.6, fat: 0.1 },
        '우유': { calories: 42, carbs: 5, protein: 3.4, fat: 1 },
        '두부': { calories: 76, carbs: 1.9, protein: 8, fat: 4.8 }
    };

    // --- Functions ---

    // Toggle Dark Mode
    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };

    // Apply saved theme on load
    const applySavedTheme = () => {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
    };

    // Modal Controls
    const openModal = () => {
        modal.style.display = 'block';
        if (userInfo) {
            document.getElementById('height').value = userInfo.height || '';
            document.getElementById('weight').value = userInfo.weight || '';
            document.getElementById('age').value = userInfo.age || '';
            document.getElementById('gender').value = userInfo.gender || 'male';
        }
    };
    const closeModal = () => modal.style.display = 'none';

    // Save User Info
    const handleFormSubmit = (e) => {
        e.preventDefault();
        userInfo = {
            height: document.getElementById('height').value,
            weight: document.getElementById('weight').value,
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        alert('정보가 저장되었습니다.');
        closeModal();
    };

    // Render meals on the list
    const renderMeals = () => {
        foodList.innerHTML = '';
        todaysMeals.forEach((meal, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <span class="food-name">${meal.name} (100g)</span>
                    <div class="food-nutrition">Cal: ${meal.calories}, C: ${meal.carbs}g, P: ${meal.protein}g, F: ${meal.fat}g</div>
                </div>
                <button class="delete-btn" data-index="${index}">&times;</button>
            `;
            foodList.appendChild(li);
        });
        saveMealsToLocalStorage();
    };

    // Add Food
    const addFood = () => {
        const foodName = foodInput.value.trim();
        if (!foodName) {
            alert("음식 이름을 입력해주세요.");
            return;
        }

        const food = foodData[foodName];
        if (!food) {
            alert(`'${foodName}'에 대한 영양 정보를 찾을 수 없습니다. 간단한 음식(예: 사과, 닭가슴살)을 입력해보세요.`);
            return;
        }

        todaysMeals.push({ name: foodName, ...food });
        renderMeals();
        foodInput.value = '';
    };

    // Delete food
    const deleteFood = (index) => {
        todaysMeals.splice(index, 1);
        renderMeals();
    };

    // Calculate Recommended Daily Intake (Harris-Benedict Equation)
    const calculateRecommendations = () => {
        if (!userInfo.height || !userInfo.weight || !userInfo.age) {
            return null;
        }

        let bmr;
        const { weight, height, age, gender } = userInfo;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
        const tdee = bmr * 1.2; // Assuming a sedentary lifestyle

        return {
            calories: tdee.toFixed(0),
            carbs: (tdee * 0.5 / 4).toFixed(0),
            protein: (tdee * 0.3 / 4).toFixed(0),
            fat: (tdee * 0.2 / 9).toFixed(0)
        };
    };

    // Show final result
    const showResult = () => {
        const recommendations = calculateRecommendations();
        if (!recommendations) {
            alert("먼저 설정에서 키, 몸무게, 나이, 성별을 입력해주세요.");
            openModal();
            return;
        }

        const totals = todaysMeals.reduce((acc, meal) => {
            acc.calories += meal.calories;
            acc.carbs += meal.carbs;
            acc.protein += meal.protein;
            acc.fat += meal.fat;
            return acc;
        }, { calories: 0, carbs: 0, protein: 0, fat: 0 });

        resultText.innerHTML = \`
            <h3>오늘의 영양 섭취 분석</h3>
            <p><strong>총 섭취 칼로리:</strong> ${totals.calories.toFixed(0)} / ${recommendations.calories} kcal</p>
            <p><strong>총 탄수화물:</strong> ${totals.carbs.toFixed(1)} / ${recommendations.carbs} g</p>
            <p><strong>총 단백질:</strong> ${totals.protein.toFixed(1)} / ${recommendations.protein} g</p>
            <p><strong>총 지방:</strong> ${totals.fat.toFixed(1)} / ${recommendations.fat} g</p>
            <hr>
            <p>${generateFeedback(totals, recommendations)}</p>
        \`;
        resultText.style.display = 'block';
    };

    // Generate simple feedback text
    const generateFeedback = (totals, recommendations) => {
        const calRatio = totals.calories / recommendations.calories;
        if (calRatio < 0.8) {
            return "아직 목표 섭취량까지는 조금 더 남았어요. 건강한 간식을 추가해보는 건 어떨까요?";
        } else if (calRatio > 1.2) {
            return "목표 섭취량을 초과했습니다. 내일은 활동량을 조금 늘려보는 것도 좋겠네요!";
        } else {
            return "훌륭해요! 목표치에 맞게 균형 잡힌 식사를 하셨습니다. 이대로 꾸준히 유지해보세요.";
        }
    };
    
    // Save meals to local storage
    const saveMealsToLocalStorage = () => {
        localStorage.setItem('todaysMeals', JSON.stringify(todaysMeals));
    };

    // --- Event Listeners ---
    themeSwitcher.addEventListener('click', toggleTheme);
    settingsBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    userInfoForm.addEventListener('submit', handleFormSubmit);

    addFoodBtn.addEventListener('click', addFood);
    foodInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addFood();
        }
    });

    foodList.addEventListener('click', (e) => {
       if (e.target.classList.contains('delete-btn')) {
           deleteFood(e.target.dataset.index);
       }
    });

    resultBtn.addEventListener('click', showResult);

    // --- Initial Load ---
    applySavedTheme();
    renderMeals();
});
