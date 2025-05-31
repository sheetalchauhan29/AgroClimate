from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os
import logging
from flask_session import Session

load_dotenv()
API_KEY = os.getenv("IBM_API_KEY")
MODEL_ID = os.getenv("MODEL_ID")
IAM_URL = os.getenv("IBM_IDENTITY_URL")
ENDPOINT = os.getenv("ENDPOINT_URL")
PROJECT_ID = os.getenv("PROJECT_ID")

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5000", "http://127.0.0.1:5000"])
app.secret_key = os.getenv("FLASK_SECRET_KEY", "my_secret_key")
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)



# logging.info("WatsonX API key: %s", API_KEY)
# logging.info("WatsonX MODEL ID: %s", MODEL_ID)
# logging.info("WatsonX IAM URL: %s", IAM_URL)
# logging.info("WatsonX ENDPOINT: %s", ENDPOINT)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")
    if "messages" not in session:
        session["messages"] = []
    session["messages"].append({"role": "user", "content": user_message})
    # logging.info(session["messages"]);
    try:
        bot_reply = get_watsonx_response(session["messages"])
        session["messages"].append({"role": "assistant", "content": bot_reply})
        logging.info(bot_reply);
        return jsonify({"reply": bot_reply})
    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"}), 500

@app.route("/")
def index():
      return render_template("index.html")

def get_watsonx_response(user_message):
    # Step 1: Get IAM token
    token_response = requests.post(
        IAM_URL,
        data={"apikey": API_KEY, "grant_type": "urn:ibm:params:oauth:grant-type:apikey"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    access_token = token_response.json()["access_token"]

    # Step 2: Prepare payload for the chat model
    payload = {
        "model_id": MODEL_ID,
        "project_id": PROJECT_ID,
        "messages": user_message,
        "type": "chat",
        "parameters": {
            "decoding_method": "greedy",  # or "sample"
            "max_new_tokens": 100,
            "stop_sequences": [],
            "repetition_penalty": 1
        }
    }

    # Step 3: Make the API request
    response = requests.post(
        ENDPOINT,
        json=payload,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
    )

    response_data = response.json()
    # logging.info("WatsonX API response: %s", response_data)
    return response_data["choices"][0]["message"]["content"]


if __name__ == "__main__":
    app.run(debug=True)