from flask import Blueprint, request, jsonify, g
from services.auth_service import register_user, authenticate_user, logout_current_user
from flask_login import current_user
from utils.auth_decorators import login_required_api

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    auth_code = data.get('auth_code')

    if not all([email, password, auth_code]):
        return jsonify({'message': 'Missing email, password, or authentication code.'}), 400

    user, error = register_user(email, password, auth_code)
    if user:
        return jsonify({'message': 'User registered successfully!', 'user_email': user.email}), 201
    return jsonify({'message': error}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'message': 'Missing email or password.'}), 400

    user, error = authenticate_user(email, password)
    if user:
        return jsonify({'message': 'Logged in successfully!', 'user_email': user.email, 'role': user.role}), 200
    return jsonify({'message': error}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required_api
def logout():
    logout_current_user()
    return jsonify({'message': 'Logged out successfully.'}), 200

@auth_bp.route('/status', methods=['GET'])
def get_auth_status():
    if current_user.is_authenticated:
        return jsonify({
            'is_authenticated': True,
            'user_email': current_user.email,
            'user_role': current_user.role,
            'user_associations': current_user.associations
        }), 200
    return jsonify({'is_authenticated': False}), 200