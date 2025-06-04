from flask import Blueprint, request, jsonify, g, send_from_directory
from services.ticket_service import (
    create_ticket,
    get_tickets,
    add_comment_to_ticket,
    close_ticket,
    delete_ticket,
    assign_ticket,
    get_ticket_by_id,
    get_total_comments_for_ticket,
    get_attachment_by_id,
)
from utils.auth_decorators import (
    login_required_api,
    admin_required_api,
    department_admin_required_api,
)
from config import Config
import os
from models import Comment

ticket_bp = Blueprint("tickets", __name__, url_prefix="/api/tickets")


@ticket_bp.route("/", methods=["POST"])
@login_required_api
def create_new_ticket():
    file = request.files.get("file", None)

    json_data = request.get_json(silent=True) or {}
    form_data = request.form

    title = form_data.get("title") or json_data.get("title")
    description = form_data.get("description") or json_data.get("description")
    location = form_data.get("location") or json_data.get("location")
    department = form_data.get("department") or json_data.get("department")

    shimmer_from_form = form_data.get("shimmer")
    if shimmer_from_form is not None:
        shimmer = shimmer_from_form.lower() == "true"
    else:
        shimmer = json_data.get("shimmer", False)

    if not all([title, description, location, department]):
        return jsonify({"message": "Missing required ticket fields."}), 400

    try:
        ticket = create_ticket(
            title=title,
            description=description,
            location=location,
            user_id=g.user.id,
            shimmer=shimmer,
            department=department,
            file=file,
        )
        return jsonify(ticket.to_dict()), 201
    except Exception as e:
        return jsonify({"message": f"Error creating ticket: {str(e)}"}), 500


@ticket_bp.route("/", methods=["GET"])
@login_required_api
def list_tickets():
    search_keyword = request.args.get("search")
    department = request.args.get("department")
    include_shimmer = request.args.get("include_shimmer", "true").lower() == "true"

    # Get the parameters but don't pass them if the service doesn't support them yet
    status_filter = request.args.get("status")
    sort_by = request.args.get("sort_by")

    # Only include parameters that are supported by the get_tickets function
    tickets = get_tickets(
        search_keyword=search_keyword,
        is_admin=(g.user.role == "admin"),
        user_id=g.user.id,
        department=department,
        include_shimmer=include_shimmer,
        status=status_filter,  # Pass this parameter
        sort_by=sort_by,
    )
    return jsonify([t.to_dict(include_comments=False) for t in tickets])


@ticket_bp.route("/<string:ticket_id>", methods=["GET"])
@login_required_api
def get_ticket(ticket_id):
    ticket = get_ticket_by_id(ticket_id)
    if not ticket:
        return jsonify({"message": "Ticket not found."}), 404

    # Basic authorization: user can see their own ticket, or if they are admin
    if ticket.user_id != g.user.id and g.user.role != "admin":
        return jsonify({"message": "Unauthorized to view this ticket."}), 403

    # If it's a shimmer ticket, only show to admins
    if ticket.shimmer and g.user.role != "admin":
        return jsonify({"message": "Unauthorized to view this ticket."}), 403

    return jsonify(ticket.to_dict())


@ticket_bp.route("/<string:ticket_id>/comments", methods=["POST"])
@login_required_api
def add_comment(ticket_id):
    if "file" not in request.files:
        file = None
    else:
        file = request.files["file"]

    comment_text = request.form.get("comment_text")
    if not comment_text:
        return jsonify({"message": "Comment text is required."}), 400

    comment = add_comment_to_ticket(ticket_id, g.user.id, comment_text, file)
    if comment:
        return jsonify(comment.to_dict()), 201
    return jsonify({"message": "Ticket not found or error adding comment."}), 404


@ticket_bp.route("/<string:ticket_id>/comments/count", methods=["GET"])
@login_required_api
def get_comments_count(ticket_id):
    count = get_total_comments_for_ticket(ticket_id)
    return jsonify({"ticket_id": ticket_id, "total_comments": count})


@ticket_bp.route("/<string:ticket_id>/close", methods=["PUT"])
@department_admin_required_api("AnyAdmin")  # Any admin can close a ticket
def close_ticket_route(ticket_id):
    ticket = close_ticket(ticket_id)
    if ticket:
        return jsonify(
            {
                "message": f"Ticket {ticket_id} closed successfully.",
                "ticket": ticket.to_dict(),
            }
        )
    return jsonify({"message": "Ticket not found."}), 404


@ticket_bp.route("/<string:ticket_id>", methods=["DELETE"])
@admin_required_api  # Admin permission to delete tickets
def delete_ticket_route(ticket_id):
    if delete_ticket(ticket_id):
        return jsonify(
            {
                "message": f"Ticket {ticket_id} and its comments/attachments deleted successfully."
            }
        )
    return jsonify({"message": "Ticket not found."}), 404


@ticket_bp.route("/<string:ticket_id>/assign", methods=["PUT"])
@department_admin_required_api("AnyAdmin")  # Any admin can assign tickets
def assign_ticket_route(ticket_id):
    data = request.get_json()
    assignee_email = data.get("assignee_email")
    if not assignee_email:
        return jsonify({"message": "Assignee email is required."}), 400

    ticket, error = assign_ticket(ticket_id, assignee_email)
    if error:
        return jsonify({"message": error}), 404
    return jsonify(
        {
            "message": f"Ticket {ticket_id} assigned to {assignee_email}.",
            "ticket": ticket.to_dict(),
        }
    )


@ticket_bp.route("/attachments/<int:attachment_id>", methods=["GET"])
@login_required_api
def download_attachment_route(attachment_id):
    attachment = get_attachment_by_id(attachment_id)
    if not attachment:
        return jsonify({"message": "Attachment not found."}), 404

    # Verify access: If attachment belongs to ticket, check ticket access. If comment, check comment/ticket access.

    # --- IMPROVED AUTHORIZATION LOGIC ---
    # Get the associated ticket (either from ticket_id or comment_id -> ticket_id)
    associated_ticket = None
    if attachment.ticket_id:
        associated_ticket = get_ticket_by_id(attachment.ticket_id)
    elif attachment.comment_id:
        comment = Comment.query.get(attachment.comment_id)
        if comment:
            associated_ticket = get_ticket_by_id(comment.ticket_id)

    if not associated_ticket:
        return jsonify({"message": "Associated ticket for attachment not found."}), 404

    # Check if user has access to the associated ticket
    if associated_ticket.user_id != g.user.id and g.user.role != "admin":
        return jsonify({"message": "Unauthorized to download this attachment."}), 403

    # If it's a shimmer ticket, only admins can download its attachments
    if associated_ticket.shimmer and g.user.role != "admin":
        return (
            jsonify(
                {
                    "message": "Unauthorized to download this attachment (shimmer ticket)."
                }
            ),
            403,
        )
    # --- END IMPROVED AUTHORIZATION LOGIC ---

    directory = os.path.dirname(attachment.filepath)
    filename = os.path.basename(attachment.filepath)

    if not os.path.exists(directory) or not os.path.isfile(attachment.filepath):
        return jsonify({"message": "Attachment file not found on server."}), 500

    return send_from_directory(directory, filename, as_attachment=True)
