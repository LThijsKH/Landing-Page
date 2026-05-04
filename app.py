from flask import Flask, render_template, request
from flask_frozen import Freezer
import json
from datetime import datetime

app = Flask(__name__)
 
def split_list(l, n=3):
    cols = [[] for _ in range(n)]
    for i, item in enumerate(l):
        cols[i % n].append(item)
    return cols

@app.route("/")
def landing():
    with open("static/data/projects.json") as f:
        featured_projects = [
            p for p in json.load(f) if p.get("featured")
        ]
    with open("static/data/cv.json") as f:
        cv = json.load(f)
    return render_template("index.html", cv=cv, projects=featured_projects)

@app.route("/photography/")
def photography():
    with open("static/data/photos.json") as f:
        images = json.load(f)
    col1, col2, col3 = split_list(images)
    return render_template("photography.html", images=images, col1=col1, col2=col2, col3=col3, total_i=len(images))

@app.route('/projects/')
def projects():
    with open("static/data/projects.json") as f:
        projects = json.load(f)
    return render_template('projects.html', projects=projects)

@app.errorhandler(404)
def not_found(e):
  return render_template("404.html"), 404

# Setup that uses frozen flask to generate static pages in /build for cloudflare pages
freezer = Freezer(app)

if __name__ == '__main__':
    freezer.freeze()  # This will generate static files in a build/ directory