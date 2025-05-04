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

1. Original (100%)
2. High (90%)
3. Medium (80%)
4. Low (60%)
5. Very Low (40%)



3. **Upload Images**: Drag and drop images onto the upload area or click to select files
4. **Generate PDF**: Click the "Generate PDF" button to create and download the PDF
5. **Start Over**: After downloading, the image list will be automatically cleared for a new batch


## Building for Production

To create an optimized production build:

```shellscript
npm run build
# or
yarn build
```

Then start the production server:

```shellscript
npm start
# or
yarn start
```

## Customization

### Modifying the PDF Layout

To change the PDF layout, edit the `handleGeneratePDF` function in `app/page.tsx`. You can adjust:

- Page margins
- Image positioning
- Title font size and position
- Watermark appearance


### Adding New Features

The modular structure makes it easy to add new features:

- Additional image processing options
- PDF metadata
- Custom page sizes
- Multiple watermark styles


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [pdf-lib](https://github.com/Hopding/pdf-lib) for PDF generation
- [react-dropzone](https://github.com/react-dropzone/react-dropzone) for file upload functionality
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [Next.js](https://nextjs.org/) for the React framework
