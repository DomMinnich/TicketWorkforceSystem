from flask import Blueprint, g, request, jsonify
from utils.email_sender import send_report_email
from utils.auth_decorators import login_required_api

general_bp = Blueprint('general', __name__, url_prefix='/api')

@general_bp.route('/report_bug', methods=['POST'])
@login_required_api # Or make it public if desired
def report_bug_api():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    location = data.get('location') # This might be context-specific location not physical
    user_email = g.user.email # Get email from authenticated user

    if not all([title, description]):
        return jsonify({'message': 'Title and description are required.'}), 400
    
    subject = "Bug Report / Feedback"
    message = (
        f"A bug has been reported.\nTitle: {title}\nDescription: {description}\n"
        f"Location: {location if location else 'N/A'}\nUser: {user_email}\n\n"
        "This is an automated message. Do not reply to this email."
    )
    send_report_email(subject, message)
    return jsonify({'message': 'Report sent successfully!'}), 200

# You can add a route for EULA or FAQ if you store them as static files
# or if the frontend is expected to fetch content from the backend.
# @general_bp.route('/eula', methods=['GET'])
# def get_eula():
#     # Read EULA text from a file or DB and return
#     with open('templates/eula.html', 'r') as f: # Assuming eula.html is in templates folder
#         eula_content = f.read()
#     return jsonify({'eula_content': eula_content})