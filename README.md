# Partial Convolution Web Demo

To try it out, clone and run:

### `pip install -r requirements.txt`
### `npm i`
### `npm start`

This will concurrently run the React frontend and Flask backend.

The frontend allows you to upload an image and erase parts of it with the mouse.
Then when you click "infill", the image and mask are sent to a PartialConvUNet in the
backend which infills your image using AI.

# References

This is an unofficial web demo of a paper, [Image Inpainting for Irregular Holes Using Partial Convolutions](https://arxiv.org/abs/1804.07723) [Liu+, arXiv2018].

### These existing open-source implementations were referenced extensively, and we are using pretrained weights from one of them:

[](https://github.com/NVIDIA/partialconv)https://github.com/NVIDIA/partialconv

[](https://github.com/naoto0804/pytorch-inpainting-with-partial-conv)https://github.com/naoto0804/pytorch-inpainting-with-partial-conv

[](https://github.com/tanimutomo/partialconv)https://github.com/tanimutomo/partialconv
