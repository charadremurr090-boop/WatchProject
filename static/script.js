let container = document.getElementById("container");

const IMG = "/static/images/";

const LOGIN_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_]{3,20}$/;

let registerData = {
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
};

let loginData = {
    username: "",
    password: ""
};

async function checkLogin() {

    const response = await fetch("/check_login");
    const result = await response.json();

    if (result.logged) {
        showMain(result.username);
    } else {
        showLogin();
    }

}

function showLogin() {

    container.className = "";

    container.innerHTML = `
<h1><img src="${IMG}lock.png" style="width:64px;height:64px;"></h1>

<h2>Авторизация</h2>

<input
id="loginUsername"
type="text"
placeholder="Логин или почта"
value="${loginData.username}"
>

<input
id="loginPassword"
type="password"
placeholder="Пароль"
value="${loginData.password}"
>

<button id="loginButton">
Войти
</button>

<p id="goRegister">
Нет аккаунта? Зарегистрироваться
</p>
`;

    document.getElementById("goRegister").onclick = showRegister;
    document.getElementById("loginButton").onclick = loginUser;

    document.getElementById("loginUsername").oninput = function() {
        loginData.username = this.value;
    };

    document.getElementById("loginPassword").oninput = function() {
        loginData.password = this.value;
    };

}

function showRegister() {

    container.className = "";

    container.innerHTML = `
<h1><img src="${IMG}paper.png" style="width:64px;height:64px;"></h1>

<h2>Регистрация</h2>

<input
id="email"
type="email"
placeholder="Почта"
value="${registerData.email}"
>

<div class="email-rules">

<div id="emailRuleFormat" class="rule invalid">
❌ Корректный адрес электронной почты
</div>

<div id="emailRuleExists" class="rule invalid">
❌ Почта не проверена
</div>

</div>

<input
id="registerUsername"
type="text"
placeholder="Логин"
value="${registerData.username}"
>

<div class="login-rules">

<div id="loginRuleLength" class="rule invalid">
❌ От 3 до 20 символов
</div>

<div id="loginRuleChars" class="rule invalid">
❌ Только английские буквы, цифры и _
</div>

<div id="loginRuleExists" class="rule invalid">
❌ Логин не проверен
</div>

</div>

<input
id="registerPassword"
type="password"
placeholder="Пароль"
value="${registerData.password}"
>

<div class="password-rules">

<div id="ruleLength" class="rule invalid">
❌ От 3 до 20 символов
</div>

<div id="ruleLetter" class="rule invalid">
❌ Есть английская буква
</div>

<div id="ruleNumber" class="rule invalid">
❌ Есть цифра
</div>

<div id="ruleChars" class="rule invalid">
❌ Только буквы, цифры и _
</div>

</div>

<input
id="confirmPassword"
type="password"
placeholder="Подтвердите пароль"
value="${registerData.confirmPassword}"
>

<div id="confirmRule" class="rule invalid">
❌ Пароли не совпадают
</div>

<button id="registerButton">
Зарегистрироваться
</button>

<p id="goLogin">
Уже есть аккаунт? Войти
</p>
`;
    document.getElementById("goLogin").onclick = showLogin;

    document.getElementById("registerButton").onclick = registerUser;

    document.getElementById("registerPassword").addEventListener("input", validatePassword);
    document.getElementById("registerPassword").addEventListener("input", validateConfirmPassword);
    document.getElementById("confirmPassword").addEventListener("input", validateConfirmPassword);

    document.getElementById("email").oninput = function() {
        registerData.email = this.value;
        validateEmail();
    };


    document.getElementById("registerUsername").oninput = function() {
        registerData.username = this.value;
        validateUsername();
    };

    document.getElementById("registerPassword").oninput = function() {
        registerData.password = this.value;
    };

    document.getElementById("confirmPassword").oninput = function() {
        registerData.confirmPassword = this.value;
    };

    validatePassword();
    validateConfirmPassword();
    validateUsername();
    validateEmail();

}

async function registerUser() {

    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirm = document.getElementById("confirmPassword").value.trim();

    if (!EMAIL_PATTERN.test(email)) {
        alert("Введите корректную электронную почту.");
        return;
    }

    if (!LOGIN_PATTERN.test(username)) {
        alert("У вас соблюдены не все требования к логину.");
        return;
    }

    if (!PASSWORD_PATTERN.test(password)) {
        alert("У вас соблюдены не все требования к паролю.");
        return;
    }

    if (password !== confirm) {
        alert("Пароли не совпадают.");
        return;
    }

    const response = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            username: username,
            password: password
        })
    });

    const result = await response.json();

    if (result.success) {

        registerData = {
            email: "",
            username: "",
            password: "",
            confirmPassword: ""
        };

        alert("Аккаунт успешно создан!");

        showLogin();

    } else {

        alert(result.message);

    }

}
async function loginUser() {

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (username === "") {
        alert("Введите логин.");
        return;
    }

    if (password === "") {
        alert("Введите пароль.");
        return;
    }

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    const result = await response.json();

    if(result.success){

    loginData.username=result.username;

    loginData.password="";

    showMain(result.username);

}

     else {

        alert(result.message || "Неверный логин или пароль.");

    }

}

function showMain(username) {

    container.className = "dashboard";

    container.innerHTML = `

<div id="mainWindow">

    <div id="leftPanel">

        <h3>Часы</h3>

            <div id="watchList"></div>

            <button id="addWatchButton">
        +
        </button>

    </div>
    <div id="rightPanel">

    <div class="welcomeScreen">

        <img
            src="${IMG}watch.png"
            alt="Watch"
            class="welcomeWatch"
        >

        <h2>Добро пожаловать, ${username}</h2>

        <p>
            Выберите часы слева.
        </p>

    </div>

</div>

`;

    document.getElementById("logoutButton")?.remove();


    document.getElementById("addWatchButton").onclick = showAddWatch;

    loadWatches();

}

function showWatchMenu() {

    document.getElementById("rightPanel").innerHTML = `

<h2>Мои часы</h2>

<button id="gpsButton">
GPS
</button>

<button id="screenButton">
Скриншот
</button>

<button id="chatButton">
Чат
</button>

<br><br>

<button id="logoutButton">
Выйти
</button>

`;

    document.getElementById("logoutButton").onclick = logout;

}

function showAddWatch() {

    document.getElementById("rightPanel").innerHTML = `

<h2>Добавить часы</h2>

<input
id="watchName"
type="text"
placeholder="Название часов"
>

<button id="createWatch">
Добавить
</button>

`;

    document.getElementById("createWatch").onclick = addWatch;
    };



async function logout() {

    await fetch("/logout");

    showLogin();

}
function validatePassword() {

    const password = document.getElementById("registerPassword").value;

    updateRule(
        "ruleLength",
        password.length >= 3 && password.length <= 20,
        "От 3 до 20 символов"
    );

    updateRule(
        "ruleLetter",
        /[A-Za-z]/.test(password),
        "Есть английская буква"
    );

    updateRule(
        "ruleNumber",
        /\d/.test(password),
        "Есть цифра"
    );

    updateRule(
        "ruleChars",
        password.length > 0 && /^[A-Za-z0-9_]+$/.test(password),
        "Только буквы, цифры и _"
    );

}

function validateConfirmPassword() {

    const password = document.getElementById("registerPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    const element = document.getElementById("confirmRule");

    if (confirm.length === 0) {

        element.className = "rule invalid";
        element.textContent = "❌ Пароли не совпадают";
        return;

    }

    if (password === confirm) {

        element.className = "rule valid";
        element.textContent = "✅ Пароли совпадают";

    } else {

        element.className = "rule invalid";
        element.textContent = "❌ Пароли не совпадают";

    }

}

function updateRule(id, ok, text) {

    const element = document.getElementById(id);

    if (ok) {

        element.className = "rule valid";
        element.textContent = "✅ " + text;

    } else {

        element.className = "rule invalid";
        element.textContent = "❌ " + text;

    }

}
async function validateUsername() {

    const username = document.getElementById("registerUsername").value;

    updateRule(
        "loginRuleLength",
        username.length >= 3 && username.length <= 20,
        "От 3 до 20 символов"
    );

    updateRule(
        "loginRuleChars",
        LOGIN_PATTERN.test(username),
        "Только английские буквы, цифры и _"
    );

    const existsRule = document.getElementById("loginRuleExists");

    if (username.length === 0) {
        existsRule.className = "rule invalid";
        existsRule.textContent = "❌ Логин не введён";
        return;
    }

    if (!LOGIN_PATTERN.test(username)) {
        existsRule.className = "rule invalid";
        existsRule.textContent = "❌ Исправьте логин";
        return;
    }

    try {

        const response = await fetch("/check_username", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username
            })
        });

        const result = await response.json();

        if (result.exists) {

            existsRule.className = "rule invalid";
            existsRule.textContent = "❌ Такой логин уже существует";

        } else {

            existsRule.className = "rule valid";
            existsRule.textContent = "✅ Логин свободен";

        }

    } catch {

        existsRule.className = "rule invalid";
        existsRule.textContent = "❌ Ошибка проверки";

    }
}
async function validateEmail() {

    const email = document.getElementById("email").value;

    updateRule(
        "emailRuleFormat",
        EMAIL_PATTERN.test(email),
        "Корректный адрес электронной почты"
    );

    const existsRule = document.getElementById("emailRuleExists");

    if (email.length === 0) {

        existsRule.className = "rule invalid";
        existsRule.textContent = "❌ Почта не введена";
        return;

    }

    if (!EMAIL_PATTERN.test(email)) {

        existsRule.className = "rule invalid";
        existsRule.textContent = "❌ Исправьте почту";
        return;

    }

    try {

        const response = await fetch("/check_email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email
            })
        });

        const result = await response.json();

        if (result.exists) {

            existsRule.className = "rule invalid";
            existsRule.textContent = "❌ Такая почта уже существует";

        } else {

            existsRule.className = "rule valid";
            existsRule.textContent = "✅ Почта свободна";

        }

    } catch {

        existsRule.className = "rule invalid";
        existsRule.textContent = "❌ Ошибка проверки";

    }

}
async function addWatch(){

const watch=document.getElementById("watchName").value.trim();

if(watch===""){
alert("Введите название часов.");
return;
}

const response=await fetch("/add_watch",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
watch_name:watch
})

});

const result=await response.json();

if(result.success){

showMain(loginData.username);

}else{

alert(result.message);

}

}

async function loadWatches(){

    const response = await fetch("/get_watches");
    const watches = await response.json();

    const list = document.getElementById("watchList");

    list.innerHTML = "";

    watches.forEach(watch => {

        const button = document.createElement("button");

        button.className = "watchButton";
        button.innerText = watch.watch_name;

        button.onclick = function () {
            showWatchMenu(watch);
        };

        list.appendChild(button);

    });

}


async function gps(){

await fetch("/gps",{
method:"POST"
});

alert("GPS");

}
async function screenshot(){

await fetch("/screenshot",{
method:"POST"
});

alert("Screenshot");

}
async function chat(){

await fetch("/chat",{
method:"POST"
});

alert("Chat");
}
checkLogin();
