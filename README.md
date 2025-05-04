# Image to PDF Converter

A web application that allows users to convert multiple images into a single PDF document. Each image is placed on a separate page with the image filename as a title and a customizable watermark.


## Features

- **Multiple Image Upload**: Drag and drop or select multiple images (JPEG, JPG, PNG)
- **Customizable Watermark**: Add your own text watermark to protect your images
- **Quality Control**: Choose image quality to balance between file size and image clarity
- **Automatic Filename Titles**: Each PDF page includes the original image filename as a title
- **Persistent Settings**: Watermark text is saved in local storage for convenience
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Next.js**: React framework for the frontend
- **Tailwind CSS**: For styling and responsive design
- **pdf-lib**: For PDF generation
- **react-dropzone**: For drag and drop file uploads
- **shadcn/ui**: For UI components

## Installation

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Steps

1. Clone the repository:

```bash
git clone https://github.com/yourusername/image-to-pdf-converter.git
cd image-to-pdf-converter
```

2. Install dependencies:


```shellscript
npm install
# or
yarn install
```

3. Run the development server:


```shellscript
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## Usage

1. **Set Watermark Text**: Enter your desired watermark text in the input field (defaults to "Do Not Copy")
2. **Select Image Quality**: Choose the quality level from the dropdown menu:

    a. Original (100%)

    b. High (90%)

    c. Medium (80%)

    d. Low (60%)

    e. Very Low (40%)

3. **Upload Images**: Drag and drop images onto the upload area or click to select files
4. **Generate PDF**: Click the "Generate PDF" button to create and download the PDF
5. **Start Over**: After downloading, the image list will be automatically cleared for a new batch
