# Database models (User, Ticket, Comment, etc.)
from datetime import datetime
from database import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

# --- User Management Models ---

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='user') # 'user', 'admin'
    associations = db.Column(db.String(50), default='alpha') # e.g., 'IT', 'Maintenance', 'Management', or 'alpha' for general user

    # Relationships
    tickets_created = db.relationship('Ticket', backref='creator', lazy=True, foreign_keys='Ticket.user_id')
    tickets_assigned = db.relationship('Ticket', backref='assignee_user', lazy=True, foreign_keys='Ticket.assignee_id')
    comments = db.relationship('Comment', backref='commenter', lazy=True)
    equipment_requests = db.relationship('EquipmentRequest', backref='request_user', lazy=True)
    user_requests = db.relationship('UserRequest', backref='request_user', lazy=True)
    student_requests = db.relationship('StudentRequest', backref='request_user', lazy=True)
    tasks = db.relationship('Task', backref='task_owner', lazy=True)
    logs = db.relationship('Log', backref='log_user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_password=False):
        data = {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'associations': self.associations
        }
        if include_password:
            data['password_hash'] = self.password_hash
        return data

# --- Ticketing System Models ---

class Ticket(db.Model):
    id = db.Column(db.String(50), primary_key=True) # Unique ID from original script (timestamp-based)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Creator
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='open') # 'open', 'closed'
    assignee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True) # Assigned technician/admin
    shimmer = db.Column(db.Boolean, default=False) # Special "Shimmer" ticket type
    department = db.Column(db.String(50), nullable=False) # 'IT', 'Maintenance', 'Management'

    comments = db.relationship('Comment', backref='ticket', lazy=True, cascade='all, delete-orphan')
    attachments = db.relationship('Attachment', backref='ticket', lazy=True, cascade='all, delete-orphan', foreign_keys='Attachment.ticket_id')

    def to_dict(self, include_comments=True):
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'user_email': self.creator.email if self.creator else None,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status,
            'assignee_email': self.assignee_user.email if self.assignee_user else None,
            'shimmer': self.shimmer,
            'department': self.department,
            'attachments': [att.to_dict() for att in self.attachments]
        }
        if include_comments:
            data['comments'] = [comment.to_dict() for comment in self.comments]
        return data

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.String(50), db.ForeignKey('ticket.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    attachments = db.relationship('Attachment', backref='comment', lazy=True, cascade='all, delete-orphan', foreign_keys='Attachment.comment_id')

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'user_email': self.commenter.email if self.commenter else None,
            'text': self.text,
            'timestamp': self.timestamp.isoformat(),
            'attachments': [att.to_dict() for att in self.attachments]
        }

class Attachment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(512), nullable=False) # Full path on server
    ticket_id = db.Column(db.String(50), db.ForeignKey('ticket.id'), nullable=True)
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Attachment {self.filename}>'

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            # 'filepath': self.filepath, # Keep filepath internal
            'ticket_id': self.ticket_id,
            'comment_id': self.comment_id,
            'url': f'/tickets/attachments/{self.id}' # Corrected endpoint
        }

# --- Request System Models ---

class EquipmentRequest(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    event = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False) # Stored as date
    time = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    equipment = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    return_date = db.Column(db.Date, nullable=False) # Stored as date
    return_time = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='open') # 'open', 'closed'
    approval_status = db.Column(db.String(50), default='pending') # 'pending', 'approved', 'denied'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'event': self.event,
            'date': self.date.isoformat(),
            'time': self.time,
            'location': self.location,
            'equipment': self.equipment,
            'description': self.description,
            'return_date': self.return_date.isoformat(),
            'return_time': self.return_time,
            'user_email': self.request_user.email if self.request_user else None,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status,
            'approval_status': self.approval_status
        }

class UserRequest(db.Model): # New Employee Request
    id = db.Column(db.String(50), primary_key=True)
    fname = db.Column(db.String(100), nullable=False)
    lname = db.Column(db.String(100), nullable=False)
    job_title = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False) # Stored as date
    description = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='open') # 'open', 'closed'

    def to_dict(self):
        return {
            'id': self.id,
            'fname': self.fname,
            'lname': self.lname,
            'job_title': self.job_title,
            'department': self.department,
            'start_date': self.start_date.isoformat(),
            'description': self.description,
            'user_email': self.request_user.email if self.request_user else None,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status
        }

class StudentRequest(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    fname = db.Column(db.String(100), nullable=False)
    lname = db.Column(db.String(100), nullable=False)
    grade = db.Column(db.String(50), nullable=False)
    teacher = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='open') # 'open', 'closed'
    email_created = db.Column(db.Boolean, default=False)
    computer_created = db.Column(db.Boolean, default=False)
    bag_created = db.Column(db.Boolean, default=False)
    id_card_created = db.Column(db.Boolean, default=False)
    azure_created = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'fname': self.fname,
            'lname': self.lname,
            'grade': self.grade,
            'teacher': self.teacher,
            'description': self.description,
            'user_email': self.request_user.email if self.request_user else None,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status,
            'email_created': self.email_created,
            'computer_created': self.computer_created,
            'bag_created': self.bag_created,
            'id_card_created': self.id_card_created,
            'azure_created': self.azure_created
        }

# --- Task Manager Models ---

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    last_completed_at = db.Column(db.DateTime, nullable=True) # For reset tasks
    category = db.Column(db.String(50), nullable=False) # 'tech', 'maintenance', 'administration'
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True) # User who created the task

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            # 'filepath': self.filepath,
            'ticket_id': self.ticket_id,
            'comment_id': self.comment_id,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'url': f'/tickets/attachments/{self.id}' # Changed from /api/attachments/
        }

class Log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    category = db.Column(db.String(50), nullable=False) # 'tech', 'maintenance', 'administration'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True) # User who performed the action

    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'timestamp': self.timestamp.isoformat(),
            'category': self.category,
            'user_email': self.log_user.email if self.log_user else None
        }