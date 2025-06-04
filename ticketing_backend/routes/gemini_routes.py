from flask import Blueprint, request, jsonify
from services.gemini_service import generate_ai_response
from utils.auth_decorators import login_required_api 

gemini_bp = Blueprint('gemini', __name__, url_prefix='/api/gemini')

@gemini_bp.route('/generate', methods=['POST'])
@login_required_api # Require user to be logged in to use chatbot
def generate_response():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Invalid JSON payload or missing Content-Type: application/json header.'}), 400

    question = data.get('question')

    if not question:
        return jsonify({'message': 'Question is required.'}), 400

    response_text, error = generate_ai_response(question)
    if error:
        # The gemini_service already logs specific errors 
        # return the user-facing error message.
        return jsonify({'message': error}), 500
    
    return jsonify({'response': response_text})