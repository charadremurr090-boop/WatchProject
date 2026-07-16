let container = document.getElementById("container");

function showLogin() {

    container.innerHTML = `

        <h1><img src="images/lock.png" style="width: 64px; height: 64px;"></h1>

        <h2>Авторизация</h2>

        <input type="text" placeholder="Логин">

        <input type="password" placeholder="Пароль">

        <button id="loginButton">Войти</button>

        <p id="goRegister">
            Нет аккаунта? Зарегистрироваться
        </p>

    `;

    document.getElementById("goRegister").onclick = function() {
        showRegister();

    };

}

function showRegister() {

    container.innerHTML = `

        <h1><img src="images/paper.png" style="width: 64px; height: 64px;"></h1>

        <h2>Регистрация</h2>

        <input type="text" placeholder="Почта">

        <input type="text" placeholder="Логин">

        <input type="password" placeholder="Пароль">

        <button id="registerButton">
            Зарегистрироваться
        </button>

        <p id="goLogin">
            Уже есть аккаунт? Войти
        </p>

    `;

    document.getElementById("goLogin").onclick = function() {
        showLogin();

    };

}

showLogin();