from flask import Flask, render_template, request, jsonify, session
import sqlite3
import re
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

DB = "database.db"


def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    email = data.get("email", "").strip()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    username_pattern = r"^[A-Za-z0-9_]{3,20}$"
    password_pattern = r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_]{3,20}$"
    email_pattern = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"

    if not re.fullmatch(email_pattern, email):
        return jsonify({
            "success": False,
            "message": "Некорректная почта."
        })

    if not re.fullmatch(username_pattern, username):
        return jsonify({
            "success": False,
            "message": "Некорректный логин."
        })

    if not re.fullmatch(password_pattern, password):
        return jsonify({
            "success": False,
            "message": "Некорректный пароль."
        })

    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        """
        SELECT * FROM users
        WHERE username=? OR email=?
        """,
        (username, email)
    )

    if cursor.fetchone():
        conn.close()
        return jsonify({
            "success": False,
            "message": "Такой логин уже существует."
        })

    cursor.execute(
        "SELECT id FROM users WHERE email=?",
        (email,)
    )

    if cursor.fetchone():
        conn.close()
        return jsonify({
            "success": False,
            "message": "Такая почта уже существует."
        })

    hashed = generate_password_hash(password)

    cursor.execute(
        """
        INSERT INTO users(email, username, password)
        VALUES(?,?,?)
        """,
        (email, username, hashed)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Аккаунт создан."
    })


@app.route("/check_username", methods=["POST"])
def check_username():

    data = request.get_json()

    username = data.get("username", "").strip()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE username=?",
        (username,)
    )

    user = cursor.fetchone()

    conn.close()

    return jsonify({
        "exists": user is not None
    })


@app.route("/check_email", methods=["POST"])
def check_email():

    data = request.get_json()

    email = data.get("email", "").strip()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE email=?",
        (email,)
    )

    user = cursor.fetchone()

    conn.close()

    return jsonify({
        "exists": user is not None
    })
@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    login = data.get("username", "").strip()
    password = data.get("password", "").strip()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT * FROM users
        WHERE username=? OR email=?
        """,
        (login, login)
    )

    user = cursor.fetchone()

    conn.close()

    if user is None:
        return jsonify({
            "success": False,
            "message": "Пользователь не найден."
        })

    if not check_password_hash(user["password"], password):
        return jsonify({
            "success": False,
            "message": "Неверный пароль."
        })

    session["user"] = user["username"]
    session["email"] = user["email"]

    return jsonify({
        "success": True,
        "username": user["username"],
        "email": user["email"]
    })

@app.route("/check_login")
def check_login():

    if "user" in session:

        return jsonify({
            "logged": True,
            "username": session["user"],
            "email": session["email"]
        })

    return jsonify({
        "logged": False
    })


@app.route("/logout")
def logout():

    session.clear()

    return jsonify({
        "success": True
    })


if __name__ == "__main__":
    init_db()

    app.run(
        host="127.0.0.1",
        port=8888,
        debug=True
    )
