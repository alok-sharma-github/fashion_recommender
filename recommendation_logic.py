import re
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai
import json

genai.configure(api_key=GOOGLE_AI_STUDIO)

def process_and_embed(user, text):
    text = user + " " + text
    result = genai.embed_content(
        model="models/embedding-001",
        content=text
    )
    return result

def scrapper(user, product, embedding_data, clothing_data):
    user_input_embedding = process_and_embed(user, product)
    if user_input_embedding is None:
        return None  # Return None if user input embedding is not available

    similarities = []
    for title, embedd in embedding_data:
        if embedd is not None:
            title_embedding = embedd['embedding']
            if title_embedding is not None:
                similarity = cosine_similarity([user_input_embedding['embedding']], [title_embedding])[0][0]
                similarities.append((title, similarity))

    similarities.sort(key=lambda x: x[1], reverse=True)
    top_similar_titles = similarities[:1]

    for title, similarity in top_similar_titles:
        row = clothing_data[title]
        return row

def gemini_chat(user, prompt):
    model = genai.GenerativeModel('gemini-pro')
    chat = model.start_chat(history=[])
    response = chat.send_message(f"You are expert fashion advisor. {prompt} for {user}. Refrain from using Markdown symbols such as `*`,` -`, `**`, `__`, etc. in output. ")
    searches = str(response.text)
    print("Searches", searches)
    return searches

# def ner(searches):
#     #entity_list = []
#     model = genai.GenerativeModel('gemini-pro')
#     chat = model.start_chat(history=[])
#     response = chat.send_message(f"Your task is to perform named entity recognition on {searches}. And provide only fashion entities as output in a list format.. Each entity be separated by a comma.")
#     ner = str(response.text)
#     print("NER: \n", ner)
    
#     # Split the string into a list based on newline characters and remove whitespace, hyphens, and asterisks
#     ner_list = [entity.strip().lstrip('-*') for entity in ner.split('\n') if entity.strip()]
    
#     return ner_list
def ner(searches):

    model = genai.GenerativeModel('gemini-pro')
    chat = model.start_chat(history=[])
    response = chat.send_message(f"Your task is to perform named entity recognition on {searches}. And provide only fashion entities as output and don't do any text formatting")
    ner = str(response.text)
    #print("NER: \n", ner)
    return ner

def extract_outfit_combinations(searches):
    # Split the string into lines
    lines = searches.split('\n')

    # Initialize an empty list to store the outfit combinations
    outfit_combinations = []

    # Extract outfit combinations from each line in searches
    for line in lines:
        # Check if the line starts with '-', '*', or a digit and does not start with '**'
        if (line.strip().startswith('-') or line.strip().startswith('*') or (line.strip() and line.strip()[0].isdigit())) and not line.strip().startswith('**'):
            # Remove the leading characters and append the line to outfit_combinations
            outfit_combinations.append(line.strip()[2:])

    # Return the filtered data
    return outfit_combinations


def get_recommendations(user, prompt):
    # Load data and embeddings
    if user == 'men':
        with open("final_men.json", "r") as json_file:
            clothing_data = json.load(json_file)
        embeddings = np.load('men_array.npy', allow_pickle=True)
    elif user == 'women':
        with open("final_women.json", "r") as json_file:
            clothing_data = json.load(json_file)
        embeddings = np.load('women_array.npy', allow_pickle=True)
    else:
        return {'error': 'Invalid user gender'}

    # Generate outfit recommendations using Gemini chat
    searches = gemini_chat(user, prompt)
    entity = ner(searches)
    combination = extract_outfit_combinations(entity)
    #print("Outfit Combinations",combination)

    # Initialize sorted outfit data
    outfit_data_sorted = {'Dress': [],'Top': [], 'Bottom': [], 'Footwear': [], 'Accessories': [], 'Jewelry':[]}


    for outfit in combination:
        # Scrape data for the outfit
        outfit_data = scrapper(user, outfit, embeddings, clothing_data)

        # Add outfit data to the sorted outfit data
        if outfit_data:
            outfit_category = outfit_data[0]['Target']
            # Check if the category exists in the dictionary, if not, initialize it
            if outfit_category not in outfit_data_sorted:
                outfit_data_sorted[outfit_category] = []
            outfit_data_sorted[outfit_category].append(outfit_data)


    print("Outfit Data: \n",outfit_data_sorted)
    return outfit_data_sorted,searches






