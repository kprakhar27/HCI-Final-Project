# HCI-Final-Project

## Project Overview

The project is fully Dockerized using Docker Compose to orchestrate the services (Flask backend, React frontend, and PostgreSQL database).

## Prerequisites
Before running the project with Docker, ensure you have the following installed:
* Docker (v20.x or higher)
* Docker Compose (v1.29 or higher)

Make sure Docker Desktop App is running.

## Running the Project with Docker

### Clone the Repository

```bash
git clone <repository_url>
cd <project_directory>
```

### Setting API Key

* Open your terminal in the project directory
* Execute the following shell commands in your terminal
```bash
# Navigate to backend/app
cd backend/app

# Create .env file
touch .env

# Set API Key
echo OPENAI_API_KEY=<API-KEY> > .env
```

###  Build and Run the Docker Containers for Database

* Navigate to the root directory of the project where your docker-compose.yml file is located.
* Run the following command to build and start all services (backend, frontend, and database):

```bash
# Create virtual environment
docker compose build --no-cache

# If you get a 401 unauthorized error:
# failed to solve: python:3.9-slim: failed to authorize: failed to fetch oauth token: unexpected status from GET request to https://auth.docker.io/token?scope=repository%3Alibrary%2Fpython%3Apull&service=registry.docker.io: #   401 Unauthorized

# please run:
docker login

# then Retry:
docker compose build --no-cache

# Activate Virtual Environemt
docker compose up -d
```
This command will:
* Build all Docker images for the project.
* Start the containers for:
    * PostgreSQL database on port 5432
    * pgAdmin sql terminal on port 5050
    * backend on port 8000
    * frontend on port 3000


### Access the Application

Once all containers and apps are up and running, you can access the application:

- **Frontend (React)**: Open your browser and go to `http://localhost:3000`.
- **Backend API (Flask)**: The Flask API will be running at `http://localhost:8000`.
- **PostgreSQL Database**: The PostgreSQL database will be running internally on port `5432`.

### Stopping and Removing Containers

To stop all running containers, use:

```bash
docker-compose down
```

This will stop and remove all containers but keep your database volume intact.

To stop and remove containers along with volumes (including PostgreSQL data), use:

```bash
docker-compose down --volumes
```

## Project Structure
```text
/backend                # Flask backend folder containing app.py and models.py files.
    app.py              # Main Flask application file.
    config.py
    /app
        __init__.py     # Initialise flask app
        models.py       # SQLAlchemy models for database schema.
        auth.py         # Routes for user authentication
        revoked_tokens.py
        routes.py       # Additional Helper Routes
        user.py         # Main Routes used by user
    Dockerfile          # Dockerfile to build flask container
    requirements.txt    # Python dependencies.

/db
    db_init.sql         # SQL file to initialise

/frontend               # React frontend folder containing components and assets.
    src/
        App.js          # Main React app for roting to other components
        /components     # folder containing all the routes for react
    package.json        # React.js dependencies.

/docker-compose.yml     # Docker Compose configuration file.
README.md               # Project documentation.
```

## License
This project is licensed under the MIT License.