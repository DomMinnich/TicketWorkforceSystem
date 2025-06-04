from functools import wraps
from flask import jsonify, g
from flask_login import current_user
from services.user_service import get_user_role, get_user_associations, get_tech_admins, get_maintenance_admins, get_management_admins
from config import Config

def login_required_api(f):
    """Ensures a user is logged in for API endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'message': 'Authentication required.'}), 401
        g.user = current_user # Make user object accessible via g
        return f(*args, **kwargs)
    return decorated_function

def admin_required_api(f):
    """Ensures the logged-in user is an admin for API endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({'message': 'Authorization denied. Admin access required.'}), 403
        g.user = current_user
        return f(*args, **kwargs)
    return decorated_function

def super_admin_required_api(f):
    """Ensures the logged-in user is the super admin for API endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.email != Config.SUPER_ADMIN_EMAIL:
            return jsonify({'message': 'Authorization denied. Super Admin access required.'}), 403
        g.user = current_user
        return f(*args, **kwargs)
    return decorated_function

# Decorator for department-specific admin access
def department_admin_required_api(department_type):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated or current_user.role != 'admin':
                return jsonify({'message': 'Authorization denied. Admin access required.'}), 403

            user_associations_str = get_user_associations(current_user.email)
            if not user_associations_str:
                return jsonify({'message': 'User associations not found.'}), 403

            user_associations = user_associations_str.split(',') # Assuming associations are comma-separated

            # Check if the admin is associated with the required department type
            is_authorized = False
            if department_type == 'IT':
                if 'bravo' in user_associations or 'echo' in user_associations or 'hotel' in user_associations or \
                   'india' in user_associations or 'kilo' in user_associations or 'lima' in user_associations or \
                   'november' in user_associations or 'oscar' in user_associations:
                    is_authorized = True
            elif department_type == 'Maintenance':
                if 'delta' in user_associations or 'golf' in user_associations or 'india' in user_associations or \
                   'juliett' in user_associations or 'lime' in user_associations or 'mike' in user_associations or \
                   'november' in user_associations or 'oscar' in user_associations:
                    is_authorized = True
            elif department_type == 'Management':
                if 'charlie' in user_associations or 'foxtrot' in user_associations or 'hotel' in user_associations or \
                   'juliett' in user_associations or 'kilo' in user_associations or 'mike' in user_associations or \
                   'november' in user_associations or 'oscar' in user_associations:
                    is_authorized = True
            elif department_type == 'AnyAdmin': # For operations any admin can do regardless of department
                is_authorized = True # Already checked role above

            if not is_authorized:
                return jsonify({'message': f'Authorization denied. Admin access for {department_type} required.'}), 403

            g.user = current_user
            return f(*args, **kwargs)
        return decorated_function
    return decorator