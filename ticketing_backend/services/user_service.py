from models import db, User
from config import Config
from werkzeug.security import generate_password_hash


def get_user_by_id(user_id):
    return User.query.get(user_id)


def get_user_by_email(email):
    return User.query.filter_by(email=email.lower()).first()


def get_all_users():
    return User.query.all()


def update_user_role(user_email, new_role, current_admin_email):
    user = get_user_by_email(user_email)
    if not user:
        return None, "User not found."

    # Prevent anyone other than the superadmin from changing the superadmin's role
    if (
        user.email == Config.SUPER_ADMIN_EMAIL
        and current_admin_email != Config.SUPER_ADMIN_EMAIL
    ):
        return None, "Cannot alter the architect of the system!"

    if new_role == "admin" and current_admin_email != Config.SUPER_ADMIN_EMAIL:
        return None, "Only the Super Admin can assign the admin role."

    if user.email == Config.SUPER_ADMIN_EMAIL and new_role != "admin":
        return (
            None,
            f"The super admin account ({Config.SUPER_ADMIN_EMAIL}) must retain the 'admin' role.",
        )

    user.role = new_role
    db.session.commit()
    return user, None


def update_user_associations(user_email, new_associations, current_admin_email):
    user = get_user_by_email(user_email)
    if not user:
        return None, "User not found."
    if (
        user.email == Config.SUPER_ADMIN_EMAIL
        and current_admin_email != Config.SUPER_ADMIN_EMAIL
    ):
        return None, "Cannot alter the architect of the system!"

    user.associations = new_associations
    db.session.commit()
    return user, None


def update_user_password(user_email, new_password, current_admin_email):
    user = get_user_by_email(user_email)
    if not user:
        return None, "User not found."
    if (
        user.email == Config.SUPER_ADMIN_EMAIL
        and current_admin_email != Config.SUPER_ADMIN_EMAIL
    ):
        return None, "Cannot alter the architect of the system!"

    user.set_password(new_password)
    db.session.commit()
    return user, None


def update_user_password_self(user_id, old_password, new_password):
    user = User.query.get(user_id)
    if not user:
        return None, "User not found."

    if not user.check_password(old_password):
        return None, "Incorrect old password."

    user.set_password(new_password)
    db.session.commit()
    return user, None


def delete_user_by_email(user_email, current_admin_email):
    user = get_user_by_email(user_email)
    if not user:
        return None, "User not found."
    if (
        user.email == Config.SUPER_ADMIN_EMAIL
        and current_admin_email != Config.SUPER_ADMIN_EMAIL
    ):
        return None, "Cannot alter the architect of the system!"

    db.session.delete(user)
    db.session.commit()
    return True, None


def get_admins():
    return [user.email for user in User.query.filter_by(role="admin").all()]


def get_tech_admins():
    return [
        user.email
        for user in User.query.filter(
            User.role == "admin",
            User.associations.in_(
                ["bravo", "echo", "hotel", "india", "kilo", "lima", "november", "oscar"]
            ),
        ).all()
    ]


def get_maintenance_admins():
    return [
        user.email
        for user in User.query.filter(
            User.role == "admin",
            User.associations.in_(
                [
                    "delta",
                    "golf",
                    "india",
                    "juliett",
                    "lime",
                    "mike",
                    "november",
                    "oscar",
                ]
            ),
        ).all()
    ]


def get_management_admins():
    return [
        user.email
        for user in User.query.filter(
            User.role == "admin",
            User.associations.in_(
                [
                    "charlie",
                    "foxtrot",
                    "hotel",
                    "juliett",
                    "kilo",
                    "mike",
                    "november",
                    "oscar",
                ]
            ),
        ).all()
    ]


def get_user_role(user_email):
    user = get_user_by_email(user_email)
    return user.role if user else None


def get_user_associations(user_email):
    user = get_user_by_email(user_email)
    return user.associations if user else None
