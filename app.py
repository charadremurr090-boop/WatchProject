from flask import Flask, render_template, request, jsonify, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "geolink_secret"

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

    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if username == "" or password == "":
        return jsonify({
            "success": False,
            "message": "Заполните все поля."
        })

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE username=?",
        (username,)
    )

    if cursor.fetchone():

        conn.close()

        return jsonify({
            "success": False,
            "message": "Такой пользователь уже существует."
        })

    hashed_password = generate_password_hash(password)

    cursor.execute(
        "INSERT INTO users(username,password) VALUES(?,?)",
        (username, hashed_password)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True
    })


@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE username=?",
        (username,)
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

    session["user"] = username

    return jsonify({
        "success": True,
        "username": username
    })


@app.route("/logout")
def logout():

    session.clear()

    return jsonify({
        "success": True
    })


@app.route("/check_login")
def check_login():

    if "user" in session:

        return jsonify({
            "logged": True,
            "username": session["user"]
        })

    return jsonify({
        "logged": False
    })


if __name__ == "__main__":
    init_db()
    app.run(debug=True)