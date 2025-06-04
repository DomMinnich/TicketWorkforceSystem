# Main Flask application instance
import os
import requests
from flask import Flask, jsonify, g, request
from flask_login import LoginManager, current_user
from werkzeug.security import generate_password_hash
from datetime import datetime, date, time
from flask_cors import CORS

from config import Config
from database import db
from models import User, Ticket, Comment, Attachment, EquipmentRequest, UserRequest, StudentRequest, Task, Log
from services.auth_service import create_initial_super_admin
from services.user_service import get_user_by_id
from utils.helpers import get_days_until_set_date

# Import Blueprints
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.ticket_routes import ticket_bp
from routes.request_routes import request_bp
from routes.task_manager_routes import task_manager_bp
from routes.general_routes import general_bp
from routes.gemini_routes import gemini_bp

app = Flask(__name__)
app.config.from_object(Config)

# Explicitly configure session cookie settings for development
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True  # Must be True when using SameSite=None
app.config['SESSION_COOKIE_HTTPONLY'] = True

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5000", "http://10.2.0.6:5000"], # Be explicit if client might use either
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], # Explicitly list allowed methods
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"] 
    }
})
# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login' # Not strictly needed for API, but good practice

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return get_user_by_id(user_id)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(ticket_bp)
app.register_blueprint(request_bp)
app.register_blueprint(task_manager_bp)
app.register_blueprint(general_bp)
app.register_blueprint(gemini_bp)

# Error Handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'message': 'Bad Request', 'error': str(error)}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'message': 'Unauthorized', 'error': str(error)}), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({'message': 'Forbidden', 'error': str(error)}), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Resource Not Found', 'error': str(error)}), 404

@app.errorhandler(500)
def internal_server_error(error):
    # Log the full exception for debugging
    app.logger.error(f"Internal Server Error: {str(error)}", exc_info=True)
    return jsonify({'message': 'Internal Server Error', 'error': 'An unexpected error occurred.'}), 500

# CLI command to initialize database and super admin
@app.cli.command('init-db')
def init_db_command():
    """Initializes the database and creates a super admin user."""
    with app.app_context():
        db.create_all()
        # Create static folders for attachments if they don't exist
        os.makedirs(os.path.join(Config.UPLOAD_FOLDER, 'ticket_attachments'), exist_ok=True)
        os.makedirs(os.path.join(Config.UPLOAD_FOLDER, 'comment_attachments'), exist_ok=True)
        os.makedirs(os.path.join(Config.UPLOAD_FOLDER, 'logs'), exist_ok=True)
        
        # Create initial super admin
        created = create_initial_super_admin()
        if created:
            print(f"Database initialized and super admin '{Config.SUPER_ADMIN_EMAIL}' created.")
            print("Please change the default super admin password immediately via the API.")
        else:
            print("Database already initialized or super admin already exists.")

# Route for downloading attachments (securely handled in ticket_routes.py)
# @app.route('/static/attachments/<path:filename>')
# def download_static_attachment(filename):
#     return send_from_directory(Config.UPLOAD_FOLDER, filename)


# --- License Expiration Check ---
def get_license_expiration_date():
    try:
        response = requests.get(Config.LICENSE_EXPIRATION_URL, timeout=5)
        response.raise_for_status() # Raise an exception for HTTP errors
        lines = response.text.splitlines()
        year = int(lines[0])
        month = int(lines[1])
        day = int(lines[2])
        return date(year, month, day)
    except Exception as e:
        app.logger.warning(f"Could not fetch license expiration from URL: {e}. Using default.")
        try:
            # Fallback to default date from config
            return datetime.strptime(Config.LICENSE_EXPIRATION_DEFAULT, "%Y-%m-%d").date()
        except ValueError:
            app.logger.error(f"Invalid default license expiration date format: {Config.LICENSE_EXPIRATION_DEFAULT}")
            return None # Or raise an error if critical

@app.before_request
def license_check():
    # Allow core auth routes before license check so admin can log in/register if needed
    if request.path.startswith('/api/auth'):
        return

    expiration_date = get_license_expiration_date()
    if expiration_date:
        if datetime.now().date() > expiration_date:
            return jsonify({
                'message': 'Service Unavailable: License Expired.',
                'expiration_date': expiration_date.isoformat(),
                'contact': Config.SUPER_ADMIN_EMAIL
            }), 503
    else:
        # If license date couldn't be determined (e.g., URL unreachable, invalid format),
        # consider this a critical error or allow temporary access based on policy.
        app.logger.error("License expiration date could not be determined. Allowing access but this requires attention.")


if __name__ == '__main__':
    host = os.getenv('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.getenv('FLASK_RUN_PORT', 5000))

    with app.app_context():
        db.create_all()
        create_initial_super_admin()

    app.run(host=host, port=port, debug=True)