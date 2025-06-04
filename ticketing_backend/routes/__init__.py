# Import all blueprints here for easier registration in app.py
from .auth_routes import auth_bp
from .user_routes import user_bp
from .ticket_routes import ticket_bp
from .request_routes import request_bp
from .task_manager_routes import task_manager_bp
from .general_routes import general_bp
from .gemini_routes import gemini_bp