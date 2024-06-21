# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY app.py /app

# Install Flask and Poppler utils (which contains pdftotext)
RUN apt-get update && apt-get install -y poppler-utils && \
  pip install Flask && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 5001

CMD ["python", "app.py"]
