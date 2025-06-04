from models import db, User
from config import Config
from flask_login import login_user, logout_user
from werkzeug.security import generate_password_hash

def register_user(email, password, auth_code):
    if User.query.filter_by(email=email.lower()).first():
        return None, "Email is already taken."

    role = 'user'
    associations = 'alpha' # Default association
    if auth_code == Config.ADMIN_AUTH_CODE:
        role = 'admin'
        associations = 'bravo'
    elif auth_code != Config.AUTH_CODE:
        return None, "Invalid Authentication Code."

    new_user = User(email=email.lower(), role=role, associations=associations)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return new_user, None

def authenticate_user(email, password):
    user = User.query.filter_by(email=email.lower()).first()
    if user and user.check_password(password):
        login_user(user)
        return user, None
    return None, "Invalid credentials."

def logout_current_user():
    logout_user()

def create_initial_super_admin():
    if not User.query.filter_by(email=Config.SUPER_ADMIN_EMAIL).first():
        super_admin = User(email=Config.SUPER_ADMIN_EMAIL, role='admin', associations='oscar') # Oscar for super admin, all departments
        super_admin.set_password('superadminpassword') # CHANGE THIS DEFAULT PASSWORD IMMEDIATELY!
        db.session.add(super_admin)
        db.session.commit()
        print(f"Super admin user '{Config.SUPER_ADMIN_EMAIL}' created with default password 'superadminpassword'.")
        return True
    return False
