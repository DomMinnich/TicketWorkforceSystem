from datetime import datetime, date
from models import db, EquipmentRequest, UserRequest, StudentRequest, User
from utils.helpers import generate_unique_id
from utils.email_sender import send_email
from services.user_service import get_user_by_email, get_user_by_id, get_tech_admins

# --- Equipment Requests ---
def create_equipment_request(name, event, request_date_str, request_time, location, equipment, description, return_date_str, return_time, user_id):
    request_id = generate_unique_id()
    try:
        request_date = datetime.strptime(request_date_str, "%Y-%m-%d").date()
        return_date = datetime.strptime(return_date_str, "%Y-%m-%d").date()
    except ValueError:
        return None, "Invalid date format. Use YYYY-MM-DD."

    new_request = EquipmentRequest(
        id=request_id,
        name=name,
        event=event,
        date=request_date,
        time=request_time,
        location=location,
        equipment=equipment,
        description=description,
        return_date=return_date,
        return_time=return_time,
        user_id=user_id,
        status='open',
        approval_status='pending'
    )
    db.session.add(new_request)
    db.session.commit()

    # Send notifications to IT admins
    request_user = get_user_by_id(user_id)
    subject = "New Equipment Request Created"
    message = (
        f"A new equipment request has been created.\nRequest ID: {request_id}\nName: {name}\n"
        f"Event: {event}\nDate: {request_date_str}\nTime: {request_time}\nLocation: {location}\n"
        f"Equipment: {equipment}\nDescription: {description}\nReturn Date: {return_date_str}\n"
        f"Return Time: {return_time}\nUser: {request_user.email if request_user else 'N/A'}\n"
        f"Timestamp: {new_request.timestamp.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        "This is an automated message. Do not reply to this email."
    )
    for admin_email in get_tech_admins():
        send_email(admin_email, subject, message)

    return new_request, None

def get_equipment_requests(search_keyword=None, current_user_id=None, is_admin=False):
    query = EquipmentRequest.query.order_by(
        db.case((EquipmentRequest.status == 'open', 0), else_=1),
        EquipmentRequest.timestamp.desc()
    )

    if not is_admin and current_user_id:
        query = query.filter_by(user_id=current_user_id)

    if search_keyword:
        keyword = f"%{search_keyword.lower()}%"
        query = query.filter(
            (EquipmentRequest.name.ilike(keyword)) |
            (EquipmentRequest.event.ilike(keyword)) |
            (EquipmentRequest.location.ilike(keyword)) |
            (EquipmentRequest.equipment.ilike(keyword)) |
            (EquipmentRequest.description.ilike(keyword)) |
            (EquipmentRequest.request_user.has(User.email.ilike(keyword)))
        )
    return query.all()

def get_equipment_request_by_id(request_id):
    return EquipmentRequest.query.get(request_id)

def approve_equipment_request(request_id):
    request = get_equipment_request_by_id(request_id)
    if not request:
        return None, "Equipment request not found."
    
    request.approval_status = 'approved'
    db.session.commit()

    # Notify user
    subject = "Equipment Request Approved"
    message = (
        f"Your equipment request with ID {request_id} has been approved. "
        f"The equipment will be available for the event: {request.event} on: {request.date.isoformat()} at: {request.time} "
        f"in: {request.location}. The equipment to be provided is: {request.equipment}. "
        f"The equipment should be returned to IT by: {request.return_date.isoformat()} at: {request.return_time}.\n\n"
        "This is an automated message. Do not reply to this email."
    )
    if request.request_user:
        send_email(request.request_user.email, subject, message)
    return request, None

def deny_equipment_request(request_id):
    request = get_equipment_request_by_id(request_id)
    if not request:
        return None, "Equipment request not found."
    
    request.approval_status = 'denied'
    db.session.commit()

    # Notify user
    subject = "Equipment Request Denied"
    message = (
        f"Your equipment request with ID {request_id} has been denied for the event: {request.event} "
        f"on: {request.date.isoformat()} at: {request.time} in: {request.location}.\n\n"
        "This is an automated message. Do not reply to this email."
    )
    if request.request_user:
        send_email(request.request_user.email, subject, message)
    return request, None

def close_equipment_request(request_id):
    request = get_equipment_request_by_id(request_id)
    if not request:
        return None
    request.status = 'closed'
    db.session.commit()
    return request

# --- User Requests (New Employee) ---
def create_user_request(fname, lname, job_title, department, start_date_str, description, user_id):
    request_id = generate_unique_id()
    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
    except ValueError:
        return None, "Invalid start date format. Use YYYY-MM-DD."

    new_request = UserRequest(
        id=request_id,
        fname=fname,
        lname=lname,
        job_title=job_title,
        department=department,
        start_date=start_date,
        description=description,
        user_id=user_id,
        status='open'
    )
    db.session.add(new_request)
    db.session.commit()

    # Notify IT admins (assuming IT handles new user creation)
    request_user = get_user_by_id(user_id)
    subject = "New User Request Created"
    message = (
        f"A new user request has been created.\nRequest ID: {request_id}\n"
        f"First Name: {fname}\nLast Name: {lname}\nJob Title: {job_title}\n"
        f"Department: {department}\nStart Date: {start_date_str}\nDescription: {description}\n"
        f"User: {request_user.email if request_user else 'N/A'}\n"
        f"Timestamp: {new_request.timestamp.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        "This is an automated message. Do not reply to this email."
    )
    for admin_email in get_tech_admins():
        send_email(admin_email, subject, message)
    
    return new_request, None

def get_user_requests(search_keyword=None, current_user_id=None, is_admin=False):
    query = UserRequest.query.order_by(
        db.case((UserRequest.status == 'open', 0), else_=1),
        UserRequest.timestamp.desc()
    )
    if not is_admin and current_user_id:
        query = query.filter_by(user_id=current_user_id)
    if search_keyword:
        keyword = f"%{search_keyword.lower()}%"
        query = query.filter(
            (UserRequest.fname.ilike(keyword)) |
            (UserRequest.lname.ilike(keyword)) |
            (UserRequest.job_title.ilike(keyword)) |
            (UserRequest.department.ilike(keyword)) |
            (UserRequest.description.ilike(keyword)) |
            (UserRequest.request_user.has(User.email.ilike(keyword)))
        )
    return query.all()

def get_user_request_by_id(request_id):
    return UserRequest.query.get(request_id)

def close_user_request(request_id):
    request = get_user_request_by_id(request_id)
    if not request:
        return None
    request.status = 'closed'
    db.session.commit()
    return request

# --- Student Requests ---
def create_student_request(fname, lname, grade, teacher, description, user_id):
    request_id = generate_unique_id()
    new_request = StudentRequest(
        id=request_id,
        fname=fname,
        lname=lname,
        grade=grade,
        teacher=teacher,
        description=description,
        user_id=user_id,
        status='open',
        email_created=False,
        computer_created=False,
        bag_created=False,
        id_card_created=False,
        azure_created=False
    )
    db.session.add(new_request)
    db.session.commit()

    # Notify IT admins (assuming IT handles student setup)
    request_user = get_user_by_id(user_id)
    subject = "New Student Request Created"
    message = (
        f"A new student request has been created.\nRequest ID: {request_id}\n"
        f"First Name: {fname}\nLast Name: {lname}\nGrade: {grade}\nTeacher: {teacher}\n"
        f"Description: {description}\nUser: {request_user.email if request_user else 'N/A'}\n"
        f"Timestamp: {new_request.timestamp.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        "This is an automated message. Do not reply to this email."
    )
    for admin_email in get_tech_admins():
        send_email(admin_email, subject, message)
    return new_request

def get_student_requests(search_keyword=None, current_user_id=None, is_admin=False):
    query = StudentRequest.query.order_by(
        db.case((StudentRequest.status == 'open', 0), else_=1),
        StudentRequest.timestamp.desc()
    )
    if not is_admin and current_user_id:
        query = query.filter_by(user_id=current_user_id)
    if search_keyword:
        keyword = f"%{search_keyword.lower()}%"
        query = query.filter(
            (StudentRequest.fname.ilike(keyword)) |
            (StudentRequest.lname.ilike(keyword)) |
            (StudentRequest.grade.ilike(keyword)) |
            (StudentRequest.teacher.ilike(keyword)) |
            (StudentRequest.description.ilike(keyword)) |
            (StudentRequest.request_user.has(User.email.ilike(keyword)))
        )
    return query.all()

def get_student_request_by_id(request_id):
    return StudentRequest.query.get(request_id)

def close_student_request(request_id):
    request = get_student_request_by_id(request_id)
    if not request:
        return None
    request.status = 'closed'
    db.session.commit()
    return request

def toggle_student_status(request_id, status_field):
    request = get_student_request_by_id(request_id)
    if not request:
        return None
    
    if not hasattr(request, status_field) or not isinstance(getattr(request, status_field), bool):
        return None # Invalid field
        
    setattr(request, status_field, not getattr(request, status_field))
    db.session.commit()
    return request