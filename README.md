# CodeSync

CodeSync is a real-time collaborative code and document synchronization platform. Built with a robust Spring Boot backend, 
it leverages WebSockets and stateless JWT authentication to provide secure, instantaneous document sharing.

## Features & API highlights
* Secure Authentication: Stateless JWT authentication delivered via HttpOnly cookies to mitigate XSS vulnerabilities.
* Real-Time Collaboration: WebSocket integration using STOMP for instant communication and document updates.
* Smart Initialization: Create new collaborative documents from scratch or instantly clone existing code files via multipart file uploads.
* Modern Security: Fully configured CORS, password hashing (BCrypt), and robust preflight request handling.
* Automated Migrations: Database schema versioning and initializations handled seamlessly via Flyway.
* Responsive frontend made with HTML, CSS and JS.
* Changeable settings for document editing: Markdown and HTML viewer, can visualize code with Monaco (VS Code UI).
* Unit tests

### API Highlights
#### Authentication
* POST /api/auth/register - Register a new user account.
* POST /api/auth/login - Authenticate and receive an HttpOnly JWT cookie.
* POST /api/auth/logout - Clear the authentication session.

#### Documents
* POST /api/documents - Create a new document (Supports multipart/form-data to clone existing files).
* GET /api/documents - Fetch documents
* GET /api/documents/{id} - Fetch document details.

#### WebSockets
* ws://localhost:8080/ws - WebSocket handshake endpoint
* /api/document/update - Updating document using websockets

## Tech Stack
* Backend: Java, Spring Boot 4
* Security: Spring Security, JJWT
* Database: PostgreSQL, Spring Data JPA, Flyway
* Build Tool: Maven

## Getting Started
### Prerequisites
* Java 21
* PostgreSQL installed and running

### Installation & Setup
1. Clone the repo:
    `git clone https://github.com/HoniT/CodeSync.git` `cd CodeSync`
2. Configure the environment:
    add an .env file and add all necessary information defined in [.env.example](.env.example)
3. Run the Application:
   On Windows:
   `mvnw.cmd spring-boot:run`
On macOS/Linux:
`./mvnw spring-boot:run`
Or just with IntelliJ

The project will start on http://localhost:8080.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.