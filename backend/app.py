from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import subprocess
import os
from predict import process_image
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "*"}})
# This is the path to the directory where you want to save the uploaded files.
# Make sure this directory exists and your application has write permissions.
UPLOAD_FOLDER = 'backend/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not (os.path.isdir('backend/uploads')):
    subprocess.run('mkdir backend/uploads', shell=True)


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'original_image' not in request.files or 'mask_image' not in request.files:
        return jsonify({'error': 'Missing files'}), 400
    
    original_image = request.files['original_image']
    mask_image = request.files['mask_image']

    if original_image.filename == '' or mask_image.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if original_image and mask_image:
        original_filename = secure_filename(original_image.filename)
        mask_filename = secure_filename(mask_image.filename)

        original_path = os.path.join(app.config['UPLOAD_FOLDER'], original_filename)
        mask_path = os.path.join(app.config['UPLOAD_FOLDER'], mask_filename)

        original_image.save(original_path)
        mask_image.save(mask_path)

        # Here you can call your Python script or function and pass the paths of the saved images
        # For example: process_images(original_path, mask_path)
        model_output = process_image(original_path, mask_path)
        encoded_image = encode_image_to_base64(model_output)
        subprocess.run('rm backend/output/*', shell=True)
        subprocess.run('rm backend/uploads/*', shell=True)
        return jsonify({'message': 'Files uploaded successfully', 'encoded_image': encoded_image}), 200

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)