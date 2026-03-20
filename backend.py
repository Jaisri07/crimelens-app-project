from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from PIL import Image
import torch
import torchvision.transforms as transforms
import torchvision.models as models

app = Flask(__name__)
CORS(app)

# 🔥 BERT MODEL
bert_model = pipeline("text-classification")

# 🔥 RESNET18 MODEL
resnet = models.resnet18(pretrained=True)
resnet.eval()

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor()
])

# 🧠 TEXT ANALYSIS
@app.route('/analyze-text', methods=['POST'])
def analyze_text():
    data = request.json
    text = data['text']

    result = bert_model(text)

    return jsonify({
        "prediction": result
    })

# 🖼️ IMAGE ANALYSIS
@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    file = request.files['image']
    img = Image.open(file)

    img = transform(img).unsqueeze(0)

    with torch.no_grad():
        output = resnet(img)

    _, predicted = torch.max(output, 1)

    return jsonify({
        "class_index": int(predicted.item())
    })

if __name__ == '__main__':
    app.run(debug=True)