# CodeSync

CodeSync is a real-time collaborative code and document synchronization platform. Built with a robust Spring Boot backend, 
it leverages WebSockets and stateless JWT authentication to provide secure, instantaneous document sharing.

## Features & API highlights
I'll fill this in when everything's finished

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