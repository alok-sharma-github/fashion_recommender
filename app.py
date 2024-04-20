from flask import Flask, render_template, request, jsonify
from recommendation_logic import get_recommendations

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/recommend', methods=['POST'])
def recommend():
    user_gender = request.form['gender']
    prompt = request.form['prompt']
    outfit_data, searches = get_recommendations(user_gender, prompt)

    # Reformat outfit data to ensure it is sent as a JSON object
    reformatted_data = {}
    for category, outfits in outfit_data.items():
        reformatted_data[category] = []
        for outfit_list in outfits:
            for outfit in outfit_list:
                reformatted_data[category].append(outfit)

    return jsonify(reformatted_data, searches)

if __name__ == '__main__':
    app.run(debug=True)
