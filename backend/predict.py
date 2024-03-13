import argparse
from distutils.util import strtobool
import os

from PIL import Image
import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
import torchvision.transforms.functional as TF
import subprocess

from src.model2 import PConvUNet


def process_image(image_path, mask_path, model_path='backend/src/iter_1000000.pth', resize=False, gpu_id=0):
    # Define the used device
    device = torch.device(f"cuda:{gpu_id}" if torch.cuda.is_available() else "cpu")

    # Define the model
    print("Loading the Model...")
    model = PConvUNet()
    model.load_state_dict(torch.load(model_path, map_location=device)['model'])
    model.to(device)
    model.eval()

    # Loading Input and Mask
    print("Loading the inputs...")
    org = Image.open(image_path)
    mask = Image.open(mask_path)

    img_transform = transforms.Compose(
    [transforms.Resize(size=(256,256)), transforms.ToTensor(),
     transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])])
    mask_transform = transforms.Compose([transforms.Resize(size=(256,256)), transforms.ToTensor()])

    org = img_transform(org.convert('RGB'))
    mask = mask_transform(mask.convert('RGB'))
    mask = 1-mask

    # Threshold the mask to remove gray pixels
    threshold = 0.5
    mask = torch.where(mask > threshold, torch.ones_like(mask), torch.zeros_like(mask))

    inp = org * mask

    # Model prediction
    print("Model Prediction...")
    with torch.no_grad():
        inp_ = inp.unsqueeze(0).to(device)
        mask_ = mask.unsqueeze(0).to(device)
        if resize:
            org_size = inp_.shape[-2:]
            inp_ = F.interpolate(inp_, size=256)
            mask_ = F.interpolate(mask_, size=256)
        raw_out, _ = model(inp_, mask_)
        raw_out = F.interpolate(raw_out, size=(500,500))
        inp = F.interpolate(inp, size=(500,500))

    # Post process
    raw_out = raw_out.to(torch.device('cpu')).squeeze()
    raw_out = raw_out.clamp(0.0, 1.0)
    mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
    std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
    raw_out = raw_out * std + mean
    inp = inp * std + mean

    out = mask * inp + (1 - mask) * raw_out

    # Saving an output image
    print("Saving the output...")
    out = TF.to_pil_image(out)
    img_name = image_path.split('/')[-1]
    if (os.path.isdir("backend/output")):
        output_path = os.path.join("backend/output", f"out_{img_name}")
    else:
        subprocess.run('mkdir backend/output', shell=True)
        output_path = os.path.join("backend/output", f"out_{img_name}")
    out.save(output_path)
    return output_path