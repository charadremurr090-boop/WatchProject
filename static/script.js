let container = document.getElementById("container");

const IMG = "/static/images/";

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

    container.innerHTML = `

        <h1>
            <img src="${IMG}lock.png" style="width:64px;height:64px;">
        </h1>

        <h2>Авторизация</h2>

        <input
            type="text"
            id="loginUsername"
            placeholder="Логин"
        >

        <input
            type="password"
            id="loginPassword"
            placeholder="Пароль"
        >

        <button id="loginButton">
            Войти
        </button>

        <p id="goRegister" style="cursor:pointer;">
            Нет аккаунта? Зарегистрироваться
        </p>

    `;

    document.getElementById("goRegister").onclick = showRegister;

    document.getElementById("loginButton").onclick = loginUser;

}

function showRegister() {

    container.innerHTML = `

        <h1>
            <img src="${IMG}paper.png" style="width:64px;height:64px;">
        </h1>

        <h2>Регистрация</h2>

        <input
            type="email"
            id="email"
            placeholder="Почта"
        >

        <input
            type="text"
            id="registerUsername"
            placeholder="Логин"
        >

        <input
            type="password"
            id="registerPassword"
            placeholder="Пароль"
        >

        <button id="registerButton">
            Зарегистрироваться
        </button>

        <p id="goLogin" style="cursor:pointer;">
            Уже есть аккаунт? Войти
        </p>

    `;

    document.getElementById("goLogin").onclick = showLogin;

    document.getElementById("registerButton").onclick = registerUser;

}

async function registerUser() {

    const username =
        document.getElementById("registerUsername").value;

    const password =
        document.getElementById("registerPassword").value;

    if(username=="" || password==""){

        alert("Заполните все поля");

        return;

    }

    const response = await fetch("/register",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            username:username,
            password:password

        })

    });

    const result = await response.json();

    if(result.success){

        alert("Аккаунт успешно создан!");

        showLogin();

    }else{

        alert(result.message);

    }

}

async function loginUser(){

    const username =
        document.getElementById("loginUsername").value;

    const password =
        document.getElementById("loginPassword").value;

    const response = await fetch("/login",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            username:username,
            password:password

        })

    });

    const result = await response.json();

    if(result.success){

        showMain(result.username);

    }else{

        alert(result.message);

    }

}

function showMain(username){

    container.innerHTML=`

        <h1>Добро пожаловать</h1>

        <h2>${username}</h2>

        <br>

        <button id="logout">
            Выйти
        </button>

    `;

    document.getElementById("logout").onclick=logout;

}

async function logout(){

    await fetch("/logout");

    showLogin();

}

checkLogin();