# KnowledgeHub 📚

**A Full-Stack Personal Knowledge Management System**

KnowledgeHub is a personal knowledge management application designed to help users capture, organize, manage, and retrieve their knowledge in one centralized platform.

Built with **React, Java Spring Boot, and MySQL**, it provides a structured environment for saving knowledge, managing topics, and tracking learning progress.

---

## 🚀 Features

- **User Authentication:** Secure registration and login using JWT-based authentication.
- **Dashboard:** Overview of your knowledge library and learning statistics.
- **Knowledge Library:** Create, view, update, and delete saved knowledge items.
- **Quick Capture:** Quickly save information to your inbox for later organization.
- **Search & Filtering:** Find saved knowledge using search and filtering functionality.
- **Topics & Tags:** Organize knowledge items into meaningful categories.
- **Learning Progress:** Track learning progress through the dashboard.
- **Persistent Storage:** Store application data in a MySQL database.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Java 21, Spring Boot 3.3.2 |
| Security | Spring Security, JWT |
| ORM | Spring Data JPA, Hibernate |
| Database | MySQL |
| Database Migration | Flyway |
| Build Tool | Maven |
| API Style | RESTful APIs |

---

## 🏗️ Project Architecture

KnowledgeHub follows a client-server architecture.

```text
                 KNOWLEDGEHUB
                      |
          +-----------+-----------+
          |                       |
     React Frontend          Spring Boot
       (Client)                (Backend)
          |                       |
          |     REST APIs         |
          +-----------------------+
                                  |
                         Spring Security
                              + JWT
                                  |
                         Spring Data JPA
                                  |
                              MySQL
```

---

## 📂 Project Structure

```text
KnowledgeHub/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │       └── db/migration/
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   └── knowledgehub/
│       ├── src/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   ├── types/
│       │   └── utils/
│       ├── package.json
│       └── vite.config.ts
│
└── .gitignore
```

---

## ⚙️ Getting Started

Follow these instructions to run KnowledgeHub locally.

### Prerequisites

Make sure you have installed:

- Java 21
- Maven
- Node.js and npm
- MySQL Server
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/altamashhh/KnowledgeHub.git
cd KnowledgeHub
```

### 2. Configure the Database

Create a MySQL database for KnowledgeHub.

```sql
CREATE DATABASE knowledgehub;
```

Configure your database connection in:

`backend/src/main/resources/application.properties`

Set your database URL, username, and password using your local configuration.

**Security:** Never commit real database passwords, JWT secrets, or API keys to GitHub.

Flyway manages database schema migrations when the backend starts.

### 3. Run the Backend

Open a terminal:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend URL:

`http://localhost:8080`

### 4. Run the Frontend

Open another terminal:

```bash
cd frontend/knowledgehub
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

## 🔐 Authentication & Security

KnowledgeHub implements authentication and API security using:

- Spring Security
- JSON Web Tokens (JWT)
- Protected REST API endpoints
- Authenticated user access

---

## 🧪 Testing

Backend tests can be executed using:

```bash
cd backend
mvn clean test
```

The test configuration uses an H2 in-memory database in MySQL compatibility mode.

---

## 🔮 Future Enhancements

Potential improvements planned for future versions:

- AI-powered knowledge summarization
- Intelligent tagging and categorization
- AI Knowledge Assistant
- Semantic search using embeddings and RAG
- AI-generated flashcards and quizzes
- Personalized learning recommendations

---

## 👨‍💻 Author

**Altamash Sheikh**

MCA Student | Full Stack Developer

- GitHub: [@altamashhh](https://github.com/altamashhh)

---

## 📄 License

This project is currently available as a public GitHub repository. A formal open-source license has not yet been added.
