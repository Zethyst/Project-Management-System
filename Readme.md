<h1 align="center">Project Management System</h1>

<p align="center">
    A modern, full-stack project management application built with React and Django. Manage organizations, projects, and tasks with a beautiful dark-themed UI and real-time updates.
</p>

## 🖥️ Tech Stack

**Frontend:**

![React.js](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)&nbsp;
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)&nbsp;
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)&nbsp;
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)&nbsp;
![ShadCN](https://img.shields.io/badge/ShadCN-000000?style=for-the-badge&logo=radixui&logoColor=white)&nbsp;
![Apollo Client](https://img.shields.io/badge/Apollo%20GraphQL-311C87?style=for-the-badge&logo=apollo-graphql&logoColor=white)&nbsp;

**Backend:**

![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)&nbsp;
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)&nbsp;
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)&nbsp;

---

## 📌 Key Features

<dl>
<dt>🏢 Organization Management:</dt>
<dd>Create and manage multiple organizations with unique slugs and contact information. Each user belongs to an organization.</dd>

<dt>📂 Project Management:</dt>
<dd>Create, update, and delete projects with status tracking (Active, On Hold, Completed) and priority levels (Low, Medium, High). Track project progress and due dates.</dd>

<dt>✅ Task Management:</dt>
<dd>Organize tasks using a Kanban board with four columns: To Do, In Progress, Review, and Done. Drag and drop tasks between columns for easy status updates.</dd>

<dt>💬 Task Comments:</dt>
<dd>Add comments to tasks for collaboration and communication. All comments are timestamped and linked to specific tasks.</dd>

<dt>🎨 Modern Dark UI:</dt>
<dd>Beautiful dark theme with cyan/teal accent colors, glass-morphism effects, and smooth animations for an enhanced user experience.</dd>

<dt>🔄 Real-time Updates:</dt>
<dd>Automatic data synchronization - projects and tasks update immediately after creation or modification without page reload.</dd>

<dt>🔍 Search & Filter:</dt>
<dd>Search projects by name and filter by status to quickly find what you're looking for.</dd>

<dt>📊 Dashboard Analytics:</dt>
<dd>View project statistics including total projects, active projects, completed projects, and total tasks at a glance.</dd>

</dl>

## 📌 Screenshots:

![dashboard](/img/Dashboard.png)
![projects](/img/Projects.png)
![tasks](/img/Tasks.png)

## 🚀 Getting Started:

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (v6 or later) or [Yarn](https://yarnpkg.com/) (v1 or later)
- [Python](https://www.python.org/) (v3.8 or later)
- [pip](https://pip.pypa.io/) (Python package manager)

## 🏠 Running the Project Locally:

### 1. Clone the Repository:

```sh
git clone https://github.com/Zethyst/Project-Management-System.git
cd Project-Management-System
```

### 2. Backend Setup (Django):

Navigate to the backend directory:

```sh
cd Backend
```

Create a virtual environment (recommended):

```sh
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install Python dependencies:

```sh
pip install -r requirements.txt
```

Run database migrations:

```sh
python manage.py migrate
```

Start the Django development server:

```sh
python manage.py runserver
```

The backend GraphQL API will be available at [http://localhost:8000/graphql/](http://localhost:8000/graphql/)

### 3. Frontend Setup (React):

Open a new terminal and navigate to the frontend directory:

```sh
cd frontend
```

Install dependencies:

```sh
npm install --legacy-peer-deps
```

Create a `.env` file in the frontend directory (if not already present):

```env
VITE_GRAPHQL_URL=http://localhost:8000/graphql/
```

Start the development server:

```sh
npm run dev
```

The frontend application will be available at [http://localhost:5173](http://localhost:5173) (Vite default port)

### 4. Using the Application:

1. Open your browser and navigate to [http://localhost:5173](http://localhost:5173)
2. Log in with your email and organization name
3. Start creating projects and tasks!

## 📁 Project Structure:

```
Project-Management-System/
├── Backend/                 # Django backend
│   ├── core/               # Django project settings
│   ├── projects/           # Projects app (models, schema)
│   └── manage.py           # Django management script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React context providers
│   │   ├── graphql/        # GraphQL queries & mutations
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript types
│   └── package.json
└── README.md
```

## 🔧 Environment Variables:

**Frontend (.env):**
- `VITE_GRAPHQL_URL`: GraphQL API endpoint (default: http://localhost:8000/graphql/)

**Backend:**
- Configured in `Backend/core/settings.py`
- CORS settings allow frontend access from `http://localhost:5173`

## 📜 License:

This project is licensed under the MIT License.

<h2>📬 Contact</h2>

If you want to contact me, you can reach me through below handles.

[![linkedin](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/akshat-jaiswal-4664a2197)

© 2025 Akshat Jaiswal

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)
