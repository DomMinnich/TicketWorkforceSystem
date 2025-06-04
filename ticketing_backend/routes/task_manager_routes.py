from flask import Blueprint, request, jsonify, g, send_file
from services.task_manager_service import (
    add_task, complete_task, reset_task, delete_task,
    get_tasks_by_category, get_logs_by_category,
    clear_logs_by_category, download_logs_by_category_to_file,
    get_dashboard_statistics
)
from utils.auth_decorators import admin_required_api, login_required_api
import os

task_manager_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

@task_manager_bp.route('/', methods=['POST'])
@admin_required_api
def add_task_api():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    category = data.get('category') # 'tech', 'maintenance', 'administration'

    if not all([title, category]):
        return jsonify({'message': 'Title and category are required.'}), 400
    if category not in ['tech', 'maintenance', 'administration']:
        return jsonify({'message': 'Invalid category.'}), 400

    task = add_task(title, description, category, g.user.id)
    return jsonify(task.to_dict()), 201

@task_manager_bp.route('/', methods=['GET'])
@login_required_api
def get_tasks_api():
    category = request.args.get('category')
    if not category or category not in ['tech', 'maintenance', 'administration']:
        return jsonify({'message': 'Valid category is required.'}), 400
    
    if g.user.role != 'admin':
        return jsonify({'message': 'Unauthorized to view tasks.'}), 403

    tasks = get_tasks_by_category(category)
    return jsonify([task.to_dict() for task in tasks])

@task_manager_bp.route('/<int:task_id>/complete', methods=['PUT'])
@admin_required_api
def complete_task_api(task_id):
    data = request.get_json()
    category = data.get('category')
    if not category or category not in ['tech', 'maintenance', 'administration']:
        return jsonify({'message': 'Valid category is required.'}), 400

    task = complete_task(task_id, category, g.user.id)
    if task:
        return jsonify(task.to_dict())
    return jsonify({'message': 'Task not found or already completed.'}), 404

@task_manager_bp.route('/<int:task_id>/reset', methods=['PUT'])
@admin_required_api
def reset_task_api(task_id):
    data = request.get_json()
    category = data.get('category')
    if not category or category not in ['tech', 'maintenance', 'administration']:
        return jsonify({'message': 'Valid category is required.'}), 400

    task = reset_task(task_id, category, g.user.id)
    if task:
        return jsonify(task.to_dict())
    return jsonify({'message': 'Task not found or not completed.'}), 404

@task_manager_bp.route('/<int:task_id>', methods=['DELETE'])
@admin_required_api
def delete_task_api(task_id):
    data = request.get_json() # Use get_json() even for DELETE if sending body
    category = data.get('category')
    if not category or category not in ['tech', 'maintenance', 'administration']:
        return jsonify({'message': 'Valid category is required.'}), 400

    if delete_task(task_id, category, g.user.id):
        return jsonify({'message': f'Task {task_id} deleted successfully.'})
    return jsonify({'message': 'Task not found.'}), 404

@task_manager_bp.route('/logs', methods=['GET'])
@admin_required_api
def get_logs_api():
    category = request.args.get('category')
    if not category or category not in ['tech', 'maintenance', 'administration']:
        return jsonify({'message': 'Valid category is required.'}), 400
    
    logs = get_logs_by_category(category)
    return jsonify([log.to_dict() for log in logs])

@task_manager_bp.route('/logs/clear', methods=['DELETE'])
@admin_required_api
def clear_logs_api():
    data = request.get_json()
    category = data.get('category')
    if not category or category not in ['tech', 'maintenance', 'administration']:
        return jsonify({'message': 'Valid category is required.'}), 400
    
    filepath = download_logs_by_category_to_file(category) # Download before clearing
    if clear_logs_by_category(category):
        return jsonify({'message': f'Logs for {category} cleared successfully. Backup created at {filepath}'})
    return jsonify({'message': 'Failed to clear logs.'}), 500

@task_manager_bp.route('/logs/download', methods=['GET'])
@admin_required_api
def download_logs_api():
    category = request.args.get('category')
    if not category or category not in ['tech', 'maintenance', 'administration']:
        return jsonify({'message': 'Valid category is required.'}), 400
    
    filepath = download_logs_by_category_to_file(category)
    if filepath and os.path.exists(filepath):
        directory = os.path.dirname(filepath)
        filename = os.path.basename(filepath)
        return send_file(filepath, as_attachment=True, download_name=filename)
    return jsonify({'message': 'No logs to download or failed to create file.'}), 404

@task_manager_bp.route('/statistics', methods=['GET'])
@login_required_api
def get_statistics_api():
    stats = get_dashboard_statistics()
    return jsonify(stats)