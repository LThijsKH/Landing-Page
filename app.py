from flask import Flask, render_template, request
from flask_frozen import Freezer
import json

app = Flask(__name__)

def split_list(l):
    total_len = len(l)
    i = total_len // 3
    ans = [l[:i], l[i:2*i], l[2*i:]]
    return ans

@app.route("/")
def landing():
    with open("static/data/cv.json") as f:
        cv = json.load(f)
    return render_template("index.html", cv=cv)

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