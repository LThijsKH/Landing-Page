from flask import Flask, render_template, request
from flask_frozen import Freezer
import json

app = Flask(__name__)

def split_list(l):
    total_len = len(l)
    i = total_len // 3
    ans = [l[:i], l[i:2*i], l[2*i:]]
    print(ans)
    return ans

@app.route("/")
def landing():
    return render_template("index.html")

@app.route("/photography/")
def photography():
    with open("static/data/photos.json") as f:
        images_list = json.load(f)
    columns = split_list(images_list)
    columns = [columns[0], columns[2], columns[1]] # col2 last of lists which is the longest
    images = columns[0] + columns[1] + columns[2]
    return render_template("photography.html", col1=columns[0], col2=columns[1], col3=columns[2], images=images, total_i=len(images))
@app.route('/projects/')
def projects():
    with open("static/data/projects.json") as f:
        projects = json.load(f)
    return render_template('projects.html', projects=projects)

# Setup that uses frozen flask to generate static pages in /build for cloudflare pages
freezer = Freezer(app)

if __name__ == '__main__':
    freezer.freeze()  # This will generate static files in a build/ directory