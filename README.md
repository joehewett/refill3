# Refill 
A small Go program for taking PDF files and parsing out structured data using a Language Model. 
-  `backend` contains a Go backend that exposes an API with a /refill endpoint
- `web` is a simple React frontend 
- `pdf-service` is a Python microservice that exposes an endpoint for reading PDF files

### Run 
- `docker-compose up --build` 
- `npm install && npm run dev` in `web`

