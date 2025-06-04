import os
from datetime import datetime
from models import db, Ticket, Comment, Attachment, User
from utils.helpers import generate_unique_id, save_attachment
from utils.email_sender import send_email
from config import Config
from services.user_service import get_user_by_id, get_user_by_email, get_tech_admins, get_maintenance_admins, get_management_admins
from zoneinfo import ZoneInfo
from datetime import datetime


def create_ticket(title, description, location, user_id, shimmer, department, file):
    ticket_id = generate_unique_id()
    new_ticket = Ticket(
        id=ticket_id,
        title=title,
        description=description,
        location=location,
        user_id=user_id,
        shimmer=shimmer,
        department=department
    )
    db.session.add(new_ticket)
    db.session.flush() # Get ticket_id before commit for attachment

    if file:
        filename, filepath = save_attachment(file, 'ticket_attachments', ticket_id)
        if filename and filepath:
            attachment = Attachment(filename=filename, filepath=filepath, ticket_id=ticket_id)
            db.session.add(attachment)

    db.session.commit()

    # Send notifications
    creator = get_user_by_id(user_id)
    subject = "New Ticket Created"
    message = (
        f"A new ticket has been created.\nTicket ID: {ticket_id}\nTitle: {title}\n"
        f"Description: {description}\nLocation: {location}\nUser: {creator.email if creator else 'N/A'}\n"
        f"Timestamp: {new_ticket.timestamp.strftime('%Y-%m-%d %H:%M:%S')}\nDepartment: {department}\n\n"
        "This is an automated message. Do not reply to this email."
    )

    admin_recipients = []
    if department == "IT":
        admin_recipients = get_tech_admins()
    elif department == "Maintenance":
        admin_recipients = get_maintenance_admins()
    elif department == "Management":
        admin_recipients = get_management_admins()

    for admin_email in admin_recipients:
        send_email(admin_email, subject + f" ({department})", message)

    return new_ticket

def get_tickets(search_keyword=None, is_admin=False, user_id=None, department=None, include_shimmer=True, status=None, sort_by=None):
    # Start with a base query without an immediate order_by, as sorting will be applied conditionally
    query = Ticket.query 

    if not is_admin:
        # Non-admins only see their own tickets and non-shimmer tickets
        query = query.filter(
            (Ticket.user_id == user_id) | (Ticket.shimmer == False) 
        )
    
    if not include_shimmer and is_admin: # Admins can filter out shimmer tickets
        query = query.filter(Ticket.shimmer == False)

    if search_keyword:
        keyword = f"%{search_keyword.lower()}%"
        query = query.filter(
            (Ticket.title.ilike(keyword)) |
            (Ticket.description.ilike(keyword)) |
            (Ticket.location.ilike(keyword)) |
            (Ticket.creator.has(User.email.ilike(keyword))) |
            (Ticket.department.ilike(keyword))
        )
    
    if department:
        query = query.filter(Ticket.department == department)

    if status:
        status_lower = status.lower()
        if status_lower == 'open':
            # Tickets are open if they don't have 'closed' in their status
            query = query.filter(~Ticket.status.ilike('%closed%'))
        elif status_lower == 'closed':
            query = query.filter(Ticket.status.ilike('%closed%'))

    # --- Sorting Logic ---
    if sort_by:
        if sort_by == 'date_desc':
            query = query.order_by(Ticket.timestamp.desc())
        elif sort_by == 'date_asc':
            query = query.order_by(Ticket.timestamp.asc())
        # Add other sorting options here if needed
    else:
        # Default sort if no specific sort_by is provided
        query = query.order_by(Ticket.timestamp.desc())

    # Cache the results to avoid processing the query twice
    result = query.all()
    return result

def get_ticket_by_id(ticket_id):
    return Ticket.query.get(ticket_id)

def add_comment_to_ticket(ticket_id, user_id, comment_text, attachment_file):
    ticket = get_ticket_by_id(ticket_id)
    if not ticket:
        return None

    new_comment = Comment(
        ticket_id=ticket_id,
        user_id=user_id,
        text=comment_text,
        timestamp=datetime.now(ZoneInfo("America/Indiana/Indianapolis"))
    )
    db.session.add(new_comment)
    db.session.flush() # To get comment ID for attachment

    if attachment_file:
        filename, filepath = save_attachment(attachment_file, 'comment_attachments', ticket_id, new_comment.timestamp.strftime('%Y-%m-%d %H:%M:%S'))
        if filename and filepath:
            attachment = Attachment(filename=filename, filepath=filepath, comment_id=new_comment.id)
            db.session.add(attachment)

    db.session.commit()

    # Notify ticket creator and relevant admins
    creator_email = ticket.creator.email if ticket.creator else None
    commenter_email = get_user_by_id(user_id).email if get_user_by_id(user_id) else 'Unknown'

    subject = "New Comment on Your Ticket"
    message = (
        f"A new comment has been added to your ticket.\nTicket ID: {ticket_id}\n"
        f"Commenter: {commenter_email}\nComment: {comment_text}\n\n"
        "This is an automated message. Do not reply to this email."
    )

    if creator_email:
        send_email(creator_email, subject, message)

    admin_recipients = []
    if ticket.department == "IT":
        admin_recipients = get_tech_admins()
    elif ticket.department == "Maintenance":
        admin_recipients = get_maintenance_admins()
    elif ticket.department == "Management":
        admin_recipients = get_management_admins()

    for admin_email in admin_recipients:
        # Avoid sending duplicate email to creator if they are also an admin
        if admin_email != creator_email:
            send_email(admin_email, subject + f" ({ticket.department})", message)

    return new_comment

def close_ticket(ticket_id):
    ticket = get_ticket_by_id(ticket_id)
    if not ticket:
        return None
    ticket.status = f"Closed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    db.session.commit()
    return ticket

def delete_ticket(ticket_id):
    ticket = get_ticket_by_id(ticket_id)
    if not ticket:
        return False

    # Delete associated attachments files
    ticket_attachments_dir = os.path.join(Config.UPLOAD_FOLDER, 'ticket_attachments', ticket_id)
    if os.path.exists(ticket_attachments_dir):
        import shutil
        shutil.rmtree(ticket_attachments_dir)

    for comment in ticket.comments:
        comment_attachments_dir = os.path.join(Config.UPLOAD_FOLDER, 'comment_attachments', ticket_id, comment.timestamp.strftime('%Y_%m_%d_%H_%M_%S'))
        if os.path.exists(comment_attachments_dir):
            import shutil
            shutil.rmtree(comment_attachments_dir)

    db.session.delete(ticket)
    db.session.commit()
    return True

def assign_ticket(ticket_id, assignee_email):
    ticket = get_ticket_by_id(ticket_id)
    if not ticket:
        return None, "Ticket not found."
    
    assignee_user = get_user_by_email(assignee_email)
    if not assignee_user:
        return None, "Assignee user not found."

    ticket.assignee_id = assignee_user.id
    db.session.commit()
    return ticket, None

def get_ticket_comments(ticket_id):
    ticket = get_ticket_by_id(ticket_id)
    if not ticket:
        return []
    return Comment.query.filter_by(ticket_id=ticket_id).order_by(Comment.timestamp.asc()).all()

def get_total_comments_for_ticket(ticket_id):
    return Comment.query.filter_by(ticket_id=ticket_id).count()

def get_attachment_by_id(attachment_id):
    return Attachment.query.get(attachment_id)