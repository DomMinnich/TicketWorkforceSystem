from flask import Blueprint, request, jsonify, g
from services.user_service import (
    get_all_users,
    get_user_by_email,
    update_user_role,
    update_user_associations,
    update_user_password,
    delete_user_by_email,
    get_admins,
    update_user_password_self,
)
from utils.auth_decorators import (
    admin_required_api,
    super_admin_required_api,
    login_required_api,
)
from config import Config

user_bp = Blueprint("users", __name__, url_prefix="/api/users")


@user_bp.route("/", methods=["GET"])
@admin_required_api
def list_users():
    users = get_all_users()
    return jsonify([user.to_dict() for user in users]), 200


@user_bp.route("/<string:email>", methods=["GET"])
@admin_required_api
def get_user_details(email):
    user = get_user_by_email(email)
    if not user:
        return jsonify({"message": "User not found."}), 404
    return jsonify(user.to_dict()), 200


@user_bp.route("/<string:email>/role", methods=["PUT"])
@admin_required_api
def update_role(email):
    data = request.get_json()
    new_role = data.get("role")
    if not new_role or new_role not in [
        "user",
        "admin",
    ]:  
        return jsonify({"message": "Invalid role provided."}), 400

    if new_role == "admin" and g.user.email != Config.SUPER_ADMIN_EMAIL:
        return (
            jsonify(
                {
                    "message": "Authorization denied. Only the Super Admin can assign the admin role."
                }
            ),
            403,
        )

    if new_role == "admin":
        current_admins_emails = get_admins()  # Fetches list of emails of current admins
        # Check if there's any other user who is already an admin.
        # 'email' is the user being updated.
        other_existing_admins = [
            admin_em for admin_em in current_admins_emails if admin_em != email
        ]
        if other_existing_admins:
            return (
                jsonify(
                    {
                        "message": f"Cannot assign 'admin' role. User '{other_existing_admins[0]}' is already the Super Admin."
                    }
                ),
                403,
            )

    # Prevent non-superadmin from changing the role of the superadmin account itself
    # This check complements service-layer protections.
    if (
        email == Config.SUPER_ADMIN_EMAIL
        and g.user.email != Config.SUPER_ADMIN_EMAIL
        and new_role != "admin"
    ):
        return (
            jsonify(
                {
                    "message": f"Authorization denied. Cannot change the role of the super admin account ({Config.SUPER_ADMIN_EMAIL})."
                }
            ),
            403,
        )

    user, error = update_user_role(email, new_role, g.user.email)
    if error:
        # Improved error handling for messages from the service layer
        if (
            "Cannot alter the architect" in error
            or "must retain the 'admin' role" in error
            or "Only the Super Admin can" in error
        ):  # Defensive check for service layer errors
            return jsonify({"message": error}), 403
        elif "User not found" in error:
            return jsonify({"message": error}), 404
        else:
            return (
                jsonify({"message": error}),
                400,
            )  # General bad request for other errors
    return (
        jsonify(
            {
                "message": f"Role updated to {user.role} for {user.email}.",
                "user": user.to_dict(),
            }
        ),
        200,
    )


@user_bp.route("/<string:email>/associations", methods=["PUT"])
@admin_required_api
def update_associations(email):
    data = request.get_json()
    new_associations = data.get("associations")
    if not new_associations:
        return jsonify({"message": "New associations not provided."}), 400

    user, error = update_user_associations(email, new_associations, g.user.email)
    if error:
        return jsonify({"message": error}), (
            403 if "Cannot alter the architect" in error else 404
        )
    return (
        jsonify(
            {
                "message": f"Associations updated to {user.associations} for {user.email}.",
                "user": user.to_dict(),
            }
        ),
        200,
    )


@user_bp.route("/<string:email>/password", methods=["PUT"])
@admin_required_api  # Or make a separate route for users to change their own password with old password verification
def update_password(email):
    data = request.get_json()
    new_password = data.get("new_password")
    if not new_password:
        return jsonify({"message": "New password not provided."}), 400

    user, error = update_user_password(email, new_password, g.user.email)
    if error:
        return jsonify({"message": error}), (
            403 if "Cannot alter the architect" in error else 404
        )
    return (
        jsonify(
            {"message": f"Password updated for {user.email}.", "user": user.to_dict()}
        ),
        200,
    )


@user_bp.route("/<string:email>", methods=["DELETE"])
@super_admin_required_api  # Only super admin can delete users
def delete_user(email):
    success, error = delete_user_by_email(email, g.user.email)
    if error:
        return jsonify({"message": error}), (
            403 if "Cannot alter the architect" in error else 404
        )
    return jsonify({"message": "User deleted successfully."}), 200


@user_bp.route("/admins", methods=["GET"])
@admin_required_api
def get_all_admins():
    admins = get_admins()
    return jsonify({"admins": admins}), 200


@user_bp.route("/self/password", methods=["PUT"])
@login_required_api
def update_self_password():
    data = request.get_json()
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not all([old_password, new_password]):
        return jsonify({"message": "Old password and new password are required."}), 400

    user, error = update_user_password_self(g.user.id, old_password, new_password)
    if error:
        return jsonify({"message": error}), 400  # Using 400 for incorrect password too
    return jsonify({"message": "Password updated successfully."}), 200
