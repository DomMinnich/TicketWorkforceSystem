
## Setup and Installation

### Prerequisites
Before you begin, ensure you have the following installed on your system:
*   **Python 3.8+**
*   **Node.js (LTS version recommended)**
*   **npm or Yarn** (npm comes with Node.js)
*   **Git**

### Backend Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/DomMinnich/TicketWorkforceSystem
    cd TicketWorkforceSystem
    ```

2.  **Navigate to the Backend Directory:**
    ```bash
    cd ticketing_backend
    ```

3.  **Create and Activate a Virtual Environment:**
    It's highly recommended to use a virtual environment to manage dependencies.
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```

4.  **Install Python Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Configure Environment Variables:**
    Create a `.env` file in the `ticketing_backend` directory (same level as `app.py`).
    Copy the contents from the provided `.env` file structure and fill in the placeholders:

    ```ini
    # Environment variables (e.g., SECRET_KEY, EMAIL_PASS)
    SECRET_KEY="your_very_secret_key_here_for_flask_sessions"
    SYSTEM_EMAIL_NAME="your_system_email@gmail.com" # e.g., seasticketingsys@gmail.com
    SYSTEM_EMAIL_PASSWORD="your_app_password" # Use an app password if using Gmail for security
    SUPER_ADMIN_EMAIL="your_super_admin_email@example.com" # This email will be the super admin
    FEEDBACK_EMAIL="feedback_recipient_email@example.com"
    
    # Authentication codes (for user registration)
    AUTH_CODE="your_auth_code" # Code for regular user registration
    ADMIN_AUTH_CODE="your_auth_code" # Code for admin user registration
    
    # Google Gemini API Key
    GEMINI_API_KEY="XXXXXXXXXXXXXXXXXXXXXXX"
    
    # License Expiration Date (YYYY-MM-DD)
    # This will be fetched from the URL, but keep a local fallback or a default for dev
    LICENSE_EXPIRATION_DEFAULT="2025-07-15"
    LICENSE_EXPIRATION_URL="https://example.txt"
    ```
    **IMPORTANT:** Change `SECRET_KEY`, `SYSTEM_EMAIL_NAME`, `SYSTEM_EMAIL_PASSWORD`, `SUPER_ADMIN_EMAIL`, `AUTH_CODE`, `ADMIN_AUTH_CODE`, and `GEMINI_API_KEY` for production. For `SYSTEM_EMAIL_PASSWORD`, if using Gmail, you MUST generate an App Password.

6.  **Initialize the Database and Super Admin:**
    This command creates the SQLite database file (`instance/tickets.db`) and the initial super admin user.
    ```bash
    flask init-db
    ```
    You will see a message like: `Database initialized and super admin 'your_super_admin_email@example.com' created. Please change the default super admin password immediately via the API.`
    The default password for the super admin is `superadminpassword1234`. **Change this immediately after logging in.**

7.  **Run the Flask Application:**
    ```bash
    flask run
    ```
    The backend will typically run on `http://127.0.0.1:5000` or `http://localhost:5000`.

### Frontend Setup

1.  **Navigate to the Frontend Directory:**
    ```bash
    cd ../ticketing_frontend
    ```

2.  **Install Node.js Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Frontend Environment Variables:**
    Create a `.env.local` file in the `ticketing_frontend` directory. This is used by Vite.
    ```ini
    VITE_GEMINI_API_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    ```


4.  **Run the React Application:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The frontend will typically run on `http://10.2.0.6:5173` as per your `vite.config.ts`. If this IP address is not available or you want to use localhost, you might need to adjust the `server.host` in `vite.config.ts` to `'localhost'` or `'0.0.0.0'` if necessary, and ensure `API_BASE_URL` in `ticketing_frontend/constants.ts` matches your backend's actual address.

## Usage

### Accessing the System
*   **Frontend (User Interface):** Open your web browser and navigate to the address where your frontend is running (e.g., `http://10.2.0.6:5173`).
*   **Backend (API Endpoints):** The API is served from `http://10.2.0.6:5000/api`.

### Authentication and Roles
1.  **Super Admin Login:** Use the `SUPER_ADMIN_EMAIL` configured in your backend's `.env` and the default password `superadminpassword1234` (case-sensitive) to log in. **Immediately change this password from the Profile page.**
2.  **Regular User Registration:** To register a new user, provide an email, password, and the `AUTH_CODE` from your backend's `.env`.
3.  **Admin User Registration:** To register a new administrator (beyond the super admin), provide an email, password, and the `ADMIN_AUTH_CODE` from your backend's `.env`. Note that only the super admin can assign the 'admin' role, and the system is configured to allow only one active super admin at a time, protecting the primary super admin account.

### Key Features Overview

*   **Dashboard:** Provides an overview of active tickets and requests.
*   **Tickets:**
    *   **Create New Ticket:** Click "Create New Ticket" to submit a new issue. You can optionally attach a file.
    *   **View/Manage Tickets:** Browse the list of tickets. Click on a ticket to view details, add comments, and download attachments.
    *   **Admin Actions (for `admin` role):** Admins can close tickets, assign tickets to other admins, and delete tickets (with super-admin confirmation for certain actions).
*   **Requests:**
    *   **Equipment Requests:** Submit requests for equipment usage. Admins (IT department association) can approve, deny, or close these requests.
    *   **New Employee Requests:** Submit requests for new staff onboarding. Admins (IT department association) can view and close these requests.
    *   **New Student Requests:** Submit requests for new student setup. Admins (IT department association) can view and mark various setup tasks as complete (email, computer, ID card, etc.).
*   **User Management (Admin Tools -> User Management):**
    *   **Admin Access Only:** Only users with the `admin` role can access this section.
    *   View all registered users.
    *   Edit user roles and associations.
    *   Reset user passwords.
    *   Delete users (only super admin can delete others).
    *   **Important:** The super admin account's role and email cannot be changed by other admins, and it cannot be deleted by anyone except itself under specific circumstances, or by another super admin if multiple exist (though the system aims for a single super admin).
*   **Task Manager (Admin Tools -> Task Manager):**
    *   **Admin Access Only:** Only users with the `admin` role can access this section.
    *   Add new tasks for `tech`, `maintenance`, or `administration` categories.
    *   Mark tasks as complete or reset them.
    *   View a log of all task actions.
    *   Download or clear task logs.
*   **AI Assistant (Floating Button):** Click the chat bubble icon in the bottom right to open the AI assistant modal. Ask questions related to the system or general IT.
*   **Report Bug / Feedback (Floating Button):** Click the bug icon in the bottom right to submit a bug report or provide feedback.
*   **License Expiration:** If the system license expires (as determined by the `LICENSE_EXPIRATION_URL`), the application will display a "Service Unavailable" page.

## Configuration
The primary configuration for the backend is done via the `.env` file in the `ticketing_backend` directory.

*   `SECRET_KEY`: A strong, random string used for session management. **MUST be unique and kept secret.**
*   `SYSTEM_EMAIL_NAME`: The email address used to send system notifications (e.g., `example@gmail.com`).
*   `SYSTEM_EMAIL_PASSWORD`: The password for the `SYSTEM_EMAIL_NAME`. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833).
*   `SUPER_ADMIN_EMAIL`: The email address for the initial super administrator account. This user has full system privileges.
*   `FEEDBACK_EMAIL`: The email address where bug reports/feedback will be sent.
*   `AUTH_CODE`: A secret code required for standard user registration.
*   `ADMIN_AUTH_CODE`: A secret code required for initial admin user registration.
*   `GEMINI_API_KEY`: Your Google Gemini API key if you enable the AI assistant.
*   `LICENSE_EXPIRATION_DEFAULT`: A fallback expiration date (`YYYY-MM-DD`) if the URL cannot be reached.
*   `LICENSE_EXPIRATION_URL`: A URL pointing to a plain text file containing the license expiration date (year, month, day on separate lines). Example: `https://example.txt`

The frontend's `API_BASE_URL` is configured in `ticketing_frontend/constants.ts` and should point to your backend's address. The `GEMINI_API_KEY` for the frontend is in `ticketing_frontend/.env.local`.

## License
"All Rights Reserved"

## Contributing
Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Commit your changes following conventional commit messages.
4.  Push your branch and create a Pull Request.

## Contact
For any questions or issues, please contact:
Dominic Minnich - dominicminnich@gmail.com

---
