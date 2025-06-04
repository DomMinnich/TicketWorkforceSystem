import os
from datetime import datetime
from models import Comment, EquipmentRequest, StudentRequest, User, UserRequest, db, Task, Log, Ticket
from utils.helpers import get_days_until_set_date
from config import Config
from services.user_service import get_user_by_id
from sqlalchemy import func



def add_task(title, description, category, user_id):
    new_task = Task(
        title=title,
        description=description,
        category=category,
        created_by_user_id=user_id
    )
    db.session.add(new_task)
    db.session.commit()
    
    # Log the action
    log_message = f"Task '{title}' added at {new_task.created_at.strftime('%B %d, %Y, %I:%M %p')} by {get_user_by_id(user_id).email if get_user_by_id(user_id) else 'N/A'}"
    add_log(log_message, category, user_id)
    
    return new_task

def complete_task(task_id, category, user_id):
    task = Task.query.filter_by(id=task_id, category=category).first()
    if not task:
        return None

    if not task.completed:
        task.completed = True
        task.completed_at = datetime.utcnow()
        db.session.commit()

        log_message = f"Task '{task.title}' completed at {task.completed_at.strftime('%B %d, %Y, %I:%M %p')} by {get_user_by_id(user_id).email if get_user_by_id(user_id) else 'N/A'}"
        add_log(log_message, category, user_id)
    
    return task

def reset_task(task_id, category, user_id):
    task = Task.query.filter_by(id=task_id, category=category).first()
    if not task:
        return None

    if task.completed:
        task.completed = False
        task.last_completed_at = task.completed_at
        task.completed_at = None # Reset completed_at when task is reset
        db.session.commit()

        log_message = f"Task '{task.title}' reset at {datetime.now().strftime('%B %d, %Y, %I:%M %p')} by {get_user_by_id(user_id).email if get_user_by_id(user_id) else 'N/A'}"
        add_log(log_message, category, user_id)
    
    return task

def delete_task(task_id, category, user_id):
    task = Task.query.filter_by(id=task_id, category=category).first()
    if not task:
        return False
    
    deleted_title = task.title
    db.session.delete(task)
    db.session.commit()

    log_message = f"Task '{deleted_title}' deleted at {datetime.now().strftime('%B %d, %Y, %I:%M %p')} by {get_user_by_id(user_id).email if get_user_by_id(user_id) else 'N/A'}"
    add_log(log_message, category, user_id)
    
    return True

def get_tasks_by_category(category):
    return Task.query.filter_by(category=category).order_by(Task.created_at.asc()).all()

def add_log(message, category, user_id):
    new_log = Log(message=message, category=category, user_id=user_id)
    db.session.add(new_log)
    db.session.commit()
    return new_log

def get_logs_by_category(category):
    return Log.query.filter_by(category=category).order_by(Log.timestamp.desc()).all()

def clear_logs_by_category(category):
    Log.query.filter_by(category=category).delete()
    db.session.commit()
    return True

def download_logs_by_category_to_file(category):
    logs = get_logs_by_category(category)
    if not logs:
        return None

    current_datetime_str = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"{current_datetime_str}_{category}_logs.txt"
    filepath = os.path.join(Config.UPLOAD_FOLDER, 'logs', filename)
    os.makedirs(os.path.join(Config.UPLOAD_FOLDER, 'logs'), exist_ok=True)

    with open(filepath, "w") as f:
        for log in logs:
            f.write(log.message + "\n")
    
    return filepath

def get_dashboard_statistics():
    total_tickets = Ticket.query.count()
    open_tickets = Ticket.query.filter(Ticket.status.ilike('open%')).count()
    closed_tickets = total_tickets - open_tickets 
    total_comments = Comment.query.count()
    shimmer_tickets = Ticket.query.filter_by(shimmer=True).count()

    total_equipment_requests = EquipmentRequest.query.count()
    total_user_requests = UserRequest.query.count()
    total_student_requests = StudentRequest.query.count()
    total_requests = total_equipment_requests + total_user_requests + total_student_requests

    total_users = User.query.count()

    # Calculate tickets per department
    department_counts_query = db.session.query(
        Ticket.department, 
        func.count(Ticket.id).label('count')
    ).group_by(Ticket.department).all()
    
    tickets_by_department = {dept: count for dept, count in department_counts_query if dept}

    return {
        "num_total_tickets": total_tickets,
        "num_open_tickets": open_tickets,
        "num_closed_tickets": closed_tickets,
        "num_comments": total_comments,
        "num_shimmer_tickets": shimmer_tickets,
        "num_equipment_requests": total_equipment_requests,
        "num_user_requests": total_user_requests,
        "num_student_requests": total_student_requests,
        "total_requests": total_requests,
        "total_users": total_users,
        "tickets_by_department": tickets_by_department
    }