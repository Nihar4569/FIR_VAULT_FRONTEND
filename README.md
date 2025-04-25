# FIR Vault: Modern FIR Tracking System

[![Frontend Repo](https://img.shields.io/badge/Frontend-Repository-blue)](https://github.com/Nihar4569/FIR_VAULT_FRONTEND)
[![Backend Repo](https://img.shields.io/badge/Backend-Repository-green)](https://github.com/Nihar4569/FIR-Vault---Backend)

FIR Vault is a comprehensive web-based application developed as a senior design project at Siksha 'O' Anusandhan University (ITER). It modernizes and streamlines the management of First Information Reports (FIRs) through digitization and real-time tracking. The platform replaces traditional manual documentation with an efficient digital system, enhancing transparency, reducing delays, and improving communication between citizens and law enforcement agencies.

![FIR Vault Banner](./screenshots/banner.png)

## 💡 Project Overview

The FIR Tracking System was created to address the inefficiencies in traditional manual FIR processing. By digitizing this critical law enforcement workflow, we aim to:

- Reduce processing delays and administrative bottlenecks
- Enhance transparency between citizens and law enforcement
- Improve case management and resource allocation
- Enable data-driven decision making in police operations
- Strengthen public trust through improved service delivery

## 🚀 Features

### Multi-Portal Architecture

- **User Portal**
  - User registration and authentication
  - FIR filing with detailed incident information
  - Real-time tracking of case status and progress

- **Police Portal**
  - Officer authentication using HRMS credentials
  - Case assignment and management
  - Investigation status updates through defined workflow
  - Evidence tracking and case documentation

- **Station Portal**
  - Station-level case management
  - Officer assignment and workload distribution
  - Overview of all FIRs within jurisdiction
  - Resource allocation and performance monitoring

- **Admin Portal**
  - System-wide management
  - Station and police officer registration
  - Account suspension capabilities
  - User management and access control

### Key Functionalities

- Streamlined FIR registration process
- Automated workflow from submission to resolution
- Real-time status tracking and updates
- Secure document handling and evidence management
- Role-based access controls for data security
- Centralized database for improved resource allocation
- Analytics for case management optimization

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Spring Boot, Java 23
- **Database**: MongoDB Atlas
- **Server**: TomCat (Backend), Webpack Dev Server (Frontend)
- **Authentication**: JWT-based authentication
- **API**: RESTful API architecture

## 📋 Prerequisites

- Node.js (v20+)
- Java Development Kit (JDK) 23
- MongoDB Atlas account
- Maven

## 🔧 Installation & Setup

The project is split into two separate repositories for frontend and backend:
- Frontend: [FIR_VAULT_FRONTEND](https://github.com/Nihar4569/FIR_VAULT_FRONTEND)
- Backend: [FIR-Vault---Backend](https://github.com/Nihar4569/FIR-Vault---Backend)

### Backend Setup

1. Clone the backend repository
   ```bash
   git clone https://github.com/Nihar4569/FIR-Vault---Backend.git
   cd FIR-Vault---Backend
   ```

2. Configure MongoDB connection
   - Open `src/main/resources/application.properties`
   - Update MongoDB connection string with your credentials

3. Build and run the Spring Boot application
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   The backend server will start on port 8090.

### Frontend Setup

1. Clone the frontend repository
   ```bash
   git clone https://github.com/Nihar4569/FIR_VAULT_FRONTEND.git
   cd FIR_VAULT_FRONTEND
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

## 📱 User Interface

### User Portal
![User Portal](./screenshots/user-portal.png)

### Police Portal
![Police Portal](./screenshots/police-portal.png)

### Admin Portal
![Admin Portal](./screenshots/admin-portal.png)

## 📊 Demo Screenshots

<details>
<summary>Click to view screenshots</summary>

### User Registration and Login
![User Login](./screenshots/user-login.png)

### FIR Filing Interface
![FIR Filing](./screenshots/fir-filing.png)

### Police Dashboard
![Police Dashboard](./screenshots/police-dashboard.png)

### Case Management
![Case Management](./screenshots/case-management.png)

### Admin Control Panel
![Admin Panel](./screenshots/admin-panel.png)

</details>

## 🔄 Workflow

1. **Complaint Registration**
   - Citizen registers and files an FIR
   - System assigns a unique FIR ID

2. **Station Assignment**
   - FIR is automatically routed to the appropriate police station
   - Station receives notification of new FIR

3. **Officer Assignment**
   - Station assigns an investigating officer
   - Complainant is notified of assignment

4. **Investigation Process**
   - Officer updates case status through defined workflow:
     - Submitted → Assigned → Investigating → Evidence Collection → Under Review → Resolved
   - Complainant can track progress in real-time

5. **Case Resolution**
   - Officer completes investigation and closes the case
   - Final status and report available to complainant

## 🔒 Security Features

- Secure authentication and authorization
- Role-based access control
- Data encryption for sensitive information
- Audit logging of all system activities
- Input validation and sanitization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Authors

- **Nihar Ranjan Sahu** - [GitHub Profile](https://github.com/Nihar4569) - Frontend & Backend Development
- **Ansuman Nanda** - [GitHub Profile](https://github.com/AnsumanNanda) - Backend Development 

## 🙏 Acknowledgements

- Faculty of Engineering & Technology (ITER), Siksha 'O' Anusandhan University
- Department of Computer Science and Engineering
- All users who provided valuable feedback during development
