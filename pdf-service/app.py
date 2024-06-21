# app.py
from flask import Flask, request, jsonify
import subprocess
import os
import uuid

app = Flask(__name__)
UPLOAD_FOLDER = '/tmp'

@app.route('/extract-text', methods=['POST'])
def extract_text():
    file = request.files['pdf']
    
    if not file:
        return jsonify({'error': 'No file provided'}), 400
    
    # Save the uploaded PDF to a temporary file
    temp_file_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.pdf")
    file.save(temp_file_path)
    
    try:
        # Call pdf2text to extract text from the saved PDF
        result = subprocess.run(['pdftotext', '-layout', temp_file_path, '-'], stdout=subprocess.PIPE)
        text = result.stdout.decode('utf-8')

        return jsonify({'text': text})

    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
