from flask import Flask, render_template, request, jsonify, redirect, url_for
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# Simple in-memory queue (list of dicts: {"code": "P001", "name": "Budi"})
queue = []

def next_code():
    return f"P{len(queue)+1 + served_count():03d}"

def served_count():
    # For stable codes even after pops, count max issued = served + waiting
    # We'll track issued via a hidden counter stored in app config
    if "issued" not in app.config:
        app.config["issued"] = 0
    return app.config["issued"]

def issue_code():
    app.config["issued"] = app.config.get("issued",0) + 1
    return f"P{app.config['issued']:03d}"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ambil", methods=["POST"])
def ambil():
    name = request.form.get("name","").strip()
    if not name:
        return redirect(url_for("index"))
    code = issue_code()
    ticket = {"code": code, "name": name}
    queue.append(ticket)
    return render_template("ambil.html", ticket=ticket)

@app.route("/lihat")
def lihat():
    return render_template("lihat.html", queue=queue)

@app.route("/panggil", methods=["GET","POST"])
def panggil():
    if request.method == "POST":
        if queue:
            next_ticket = queue.pop(0)
            return render_template("panggil.html", ticket=next_ticket)
        else:
            return render_template("panggil.html", ticket=None)
    else:
        return render_template("panggil.html", ticket=None)

@app.route("/api/peek")
def api_peek():
    return jsonify({"queue": queue, "count": len(queue)})

@app.route("/api/reset", methods=["POST"])
def api_reset():
    queue.clear()
    app.config["issued"] = 0
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(debug=True)
