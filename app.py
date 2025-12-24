from flask import Flask, render_template, request
from flask_frozen import Freezer
import json

app = Flask(__name__)

@app.route("/")
def landing():
    return render_template("index.html")

@app.route("/photography/")
def photography():
    return render_template("photography.html")

@app.route('/projects/')
def projects():
    with open("static/data/projects.json") as f:
        projects = json.load(f)
    return render_template('projects.html', projects=projects)

# Setup that uses frozen flask to generate static pages in /build for cloudflare pages
freezer = Freezer(app)

if __name__ == '__main__':
    freezer.freeze()  # This will generate static files in a build/ directory