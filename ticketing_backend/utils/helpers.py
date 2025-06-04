import os
from datetime import datetime, date
from werkzeug.utils import secure_filename
from config import Config  # Import Config to use UPLOAD_FOLDER and ALLOWED_EXTENSIONS
from zoneinfo import ZoneInfo  # Add this import


def generate_unique_id():
    """Generates a timestamp-based unique ID for tickets/requests using Indiana time."""
    tz = ZoneInfo("America/Indiana/Indianapolis")
    return str(
        int(datetime.now(tz).timestamp() * 1000000)
    )  # More granular timestamp with Indiana time


def allowed_file(filename):
    """Checks if a file's extension is allowed."""
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS
    )


def save_attachment(file, subfolder, item_id, comment_timestamp=None):
    """Saves a file to the appropriate static subfolder."""
    if not file or not allowed_file(file.filename):
        return None, None

    # Determine the directory path
    if subfolder == "ticket_attachments":
        target_dir = os.path.join(Config.UPLOAD_FOLDER, subfolder, str(item_id))
    elif subfolder == "comment_attachments" and comment_timestamp:
        sanitized_timestamp = (
            comment_timestamp.replace(":", "_").replace(" ", "_").replace(".", "_")
        )
        target_dir = os.path.join(
            Config.UPLOAD_FOLDER, subfolder, str(item_id), sanitized_timestamp
        )
    else:
        return None, None  # Invalid subfolder or missing timestamp for comments

    os.makedirs(target_dir, exist_ok=True)
    filename = secure_filename(file.filename)
    filepath = os.path.join(target_dir, filename)
    file.save(filepath)
    return filename, filepath


def get_days_until_set_date(set_date_str):
    """Calculates days remaining until a specific date string (YYYY-MM-DD)."""
    try:
        set_date = datetime.strptime(set_date_str, "%Y-%m-%d").date()
        # Use Indiana time instead of UTC:
        current_date = datetime.now(ZoneInfo("America/Indiana/Indianapolis")).date()
        return (set_date - current_date).days
    except ValueError:
        return None  # Handle invalid date string


def format_duration(minutes):
    hours = int(minutes) // 60
    remaining_minutes = int(minutes) % 60
    return f"{hours}:{remaining_minutes:02d}"


def format_time_12hr(time_obj):
    if not isinstance(time_obj, datetime.time):
        return None  # Or raise an error
    return time_obj.strftime("%I:%M %p").lstrip("0")  # "1:30 PM", not "01:30 PM"
