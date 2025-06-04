from flask import Blueprint, request, jsonify, g
from services.request_service import (
    create_equipment_request, get_equipment_requests, get_equipment_request_by_id,
    approve_equipment_request, deny_equipment_request, close_equipment_request,
    create_user_request, get_user_requests, get_user_request_by_id, close_user_request,
    create_student_request, get_student_requests, get_student_request_by_id,
    close_student_request, toggle_student_status
)
from utils.auth_decorators import login_required_api, admin_required_api, department_admin_required_api

request_bp = Blueprint('requests', __name__, url_prefix='/api/requests')

# --- Equipment Requests ---
@request_bp.route('/equipment', methods=['POST'])
@login_required_api
def create_equipment_ticket_api():
    data = request.get_json()
    required_fields = ['name', 'event', 'date', 'time', 'location', 'equipment', 'description', 'return_date', 'return_time']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields.'}), 400

    req, error = create_equipment_request(
        name=data['name'],
        event=data['event'],
        request_date_str=data['date'],
        request_time=data['time'],
        location=data['location'],
        equipment=data['equipment'],
        description=data['description'],
        return_date_str=data['return_date'],
        return_time=data['return_time'],
        user_id=g.user.id
    )
    if error: return jsonify({'message': error}), 400
    return jsonify(req.to_dict()), 201

@request_bp.route('/equipment', methods=['GET'])
@login_required_api
def list_equipment_requests():
    search_keyword = request.args.get('search')
    requests = get_equipment_requests(
        search_keyword=search_keyword,
        current_user_id=g.user.id,
        is_admin=(g.user.role == 'admin')
    )
    return jsonify([req.to_dict() for req in requests])

@request_bp.route('/equipment/<string:request_id>', methods=['GET'])
@login_required_api
def get_equipment_request_details(request_id):
    req = get_equipment_request_by_id(request_id)
    if not req:
        return jsonify({'message': 'Equipment request not found.'}), 404
    # Basic auth: user can see their own request, or if they are admin
    if req.user_id != g.user.id and g.user.role != 'admin':
        return jsonify({'message': 'Unauthorized to view this request.'}), 403
    return jsonify(req.to_dict())

@request_bp.route('/equipment/<string:request_id>/approve', methods=['PUT'])
@department_admin_required_api('IT') # IT admin to approve
def approve_equipment_request_route(request_id):
    req, error = approve_equipment_request(request_id)
    if error: return jsonify({'message': error}), 404
    return jsonify({'message': f'Request {request_id} approved. Notification sent.', 'request': req.to_dict()})

@request_bp.route('/equipment/<string:request_id>/deny', methods=['PUT'])
@department_admin_required_api('IT') # IT admin to deny
def deny_equipment_request_route(request_id):
    req, error = deny_equipment_request(request_id)
    if error: return jsonify({'message': error}), 404
    return jsonify({'message': f'Request {request_id} denied. Notification sent.', 'request': req.to_dict()})

@request_bp.route('/equipment/<string:request_id>/close', methods=['PUT'])
@department_admin_required_api('IT') # IT admin to close
def close_equipment_request_route(request_id):
    req = close_equipment_request(request_id)
    if not req:
        return jsonify({'message': 'Equipment request not found.'}), 404
    return jsonify({'message': f'Request {request_id} has been closed.', 'request': req.to_dict()})

# --- User Requests (New Employee) ---
@request_bp.route('/users', methods=['POST'])
@login_required_api
def create_new_user_request_api():
    data = request.get_json()
    required_fields = ['fname', 'lname', 'job_title', 'department', 'start_date', 'description']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields.'}), 400

    req, error = create_user_request(
        fname=data['fname'],
        lname=data['lname'],
        job_title=data['job_title'],
        department=data['department'],
        start_date_str=data['start_date'],
        description=data['description'],
        user_id=g.user.id
    )
    if error: return jsonify({'message': error}), 400
    return jsonify(req.to_dict()), 201

@request_bp.route('/users', methods=['GET'])
@login_required_api
def list_user_requests():
    search_keyword = request.args.get('search')
    requests = get_user_requests(
        search_keyword=search_keyword,
        current_user_id=g.user.id,
        is_admin=(g.user.role == 'admin')
    )
    return jsonify([req.to_dict() for req in requests])

@request_bp.route('/users/<string:request_id>', methods=['GET'])
@login_required_api
def get_user_request_details(request_id):
    req = get_user_request_by_id(request_id)
    if not req:
        return jsonify({'message': 'User request not found.'}), 404
    if req.user_id != g.user.id and g.user.role != 'admin':
        return jsonify({'message': 'Unauthorized to view this request.'}), 403
    return jsonify(req.to_dict())

@request_bp.route('/users/<string:request_id>/close', methods=['PUT'])
@department_admin_required_api('IT') # IT admin to close
def close_user_request_route(request_id):
    req = close_user_request(request_id)
    if not req:
        return jsonify({'message': 'User request not found.'}), 404
    return jsonify({'message': f'Request {request_id} has been closed.', 'request': req.to_dict()})

# --- Student Requests ---
@request_bp.route('/students', methods=['POST'])
@login_required_api
def create_new_student_request_api():
    data = request.get_json()
    required_fields = ['fname', 'lname', 'grade', 'teacher', 'description']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields.'}), 400

    req = create_student_request(
        fname=data['fname'],
        lname=data['lname'],
        grade=data['grade'],
        teacher=data['teacher'],
        description=data['description'],
        user_id=g.user.id
    )
    return jsonify(req.to_dict()), 201

@request_bp.route('/students', methods=['GET'])
@login_required_api
def list_student_requests():
    search_keyword = request.args.get('search')
    requests = get_student_requests(
        search_keyword=search_keyword,
        current_user_id=g.user.id,
        is_admin=(g.user.role == 'admin')
    )
    return jsonify([req.to_dict() for req in requests])

@request_bp.route('/students/<string:request_id>', methods=['GET'])
@login_required_api
def get_student_request_details(request_id):
    req = get_student_request_by_id(request_id)
    if not req:
        return jsonify({'message': 'Student request not found.'}), 404
    if req.user_id != g.user.id and g.user.role != 'admin':
        return jsonify({'message': 'Unauthorized to view this request.'}), 403
    return jsonify(req.to_dict())

@request_bp.route('/students/<string:request_id>/close', methods=['PUT'])
@department_admin_required_api('IT') # IT admin to close
def close_student_request_route(request_id):
    req = close_student_request(request_id)
    if not req:
        return jsonify({'message': 'Student request not found.'}), 404
    return jsonify({'message': f'Request {request_id} has been closed.', 'request': req.to_dict()})

@request_bp.route('/students/<string:request_id>/toggle/<string:status_field>', methods=['PUT'])
@department_admin_required_api('IT') # IT admin to toggle student statuses
def toggle_student_status_route(request_id, status_field):
    allowed_fields = ['email_created', 'computer_created', 'bag_created', 'id_card_created', 'azure_created']
    if status_field not in allowed_fields:
        return jsonify({'message': 'Invalid status field.'}), 400

    req = toggle_student_status(request_id, status_field)
    if not req:
        return jsonify({'message': 'Student request not found or invalid field.'}), 404
    return jsonify({'message': f'{status_field} toggled for request {request_id}.', 'request': req.to_dict()})