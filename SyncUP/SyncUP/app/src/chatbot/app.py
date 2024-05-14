from flask import Flask, request, jsonify
from flask_cors import CORS
from Chatbot import get_response

app = Flask(__name__)
CORS(app)

@app.route('/api/chatbot', methods=['GET', 'POST'])
def chatbot():
    if request.method == 'GET':
        user_input = request.args.get('user_input', '')
        topic = request.args.get('topic', '') 
    elif request.method == 'POST':
        data = request.get_json()
        user_input = data.get('user_input', '')
        topic = data.get('topic', '') 
    else:
        return jsonify({'message': 'Unsupported request method'}), 400

    chatbot_response = get_response(user_input, topic)
    return jsonify({'message': chatbot_response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
