"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileImage, FileCheck, Loader2 } from "lucide-react"

export default function ImageToPDFConverter() {
  const [files, setFiles] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles])
    },
  })

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Function to convert image file to data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Function to resize image using Canvas
  const resizeImage = (dataUrl: string, maxWidth = 1600, maxHeight = 1200): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to data URL
        resolve(canvas.toDataURL("image/jpeg", 0.8))
      }
      img.src = dataUrl
    })
  }

  // Function to add watermark to image
  const addWatermark = (dataUrl: string, watermarkText: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")

        // Draw original image
        ctx?.drawImage(img, 0, 0)

        // Add watermark
        if (ctx) {
          // Calculate font size based on image width
          // Make it large enough to span across the image horizontally
          const fontSize = Math.floor((img.width / watermarkText.length) * 1.6)

          ctx.font = `bold ${fontSize}px Arial`
          ctx.fillStyle = "rgba(200, 200, 200, 0.5)"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          // Draw text in the center of the image (horizontally)
          ctx.fillText(watermarkText, img.width / 2, img.height / 2)
        }

        // Convert to data URL
        resolve(canvas.toDataURL("image/png", 0.8))
      }
      img.src = dataUrl
    })
  }

  // Function to remove file extension from filename
  const removeFileExtension = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf(".")
    if (lastDotIndex === -1) return filename
    return filename.substring(0, lastDotIndex)
  }

  const handleGeneratePDF = async () => {
    if (files.length === 0) return

    setIsGenerating(true)
    setProgress(0)

    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create()

      // Get the default font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Update progress
        setProgress((i / files.length) * 90)

        // Convert file to data URL
        const dataUrl = await fileToDataUrl(file)

        // Resize image
        const resizedDataUrl = await resizeImage(dataUrl)

        // Add watermark
        const watermarkedDataUrl = await addWatermark(resizedDataUrl, "Cleide Fotos")

        // Convert data URL to Uint8Array for pdf-lib
        const base64Data = watermarkedDataUrl.split(",")[1]
        const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

        // Embed the image in the PDF
        const image = await pdfDoc.embedPng(imageBytes)

        // Add a new page with appropriate dimensions
        const { width, height } = image.scale(1)
        const page = pdfDoc.addPage([width + 100, height + 150])

        // Draw the image
        page.drawImage(image, {
          x: 50,
          y: 100, // Position higher to leave space for filename at bottom
          width,
          height,
        })

        // Add the filename as title (without extension)
        const fileName = removeFileExtension(file.name)
        const titleFontSize = 28
        const titleWidth = font.widthOfTextAtSize(fileName, titleFontSize)
        page.drawText(fileName, {
          x: (page.getWidth() - titleWidth) / 2,
          y: 50, // Position at bottom of page
          size: titleFontSize,
          font,
          color: rgb(0, 0, 0),
        })
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save()
      setProgress(100)

      // Create download link
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "images.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Image to PDF Converter</CardTitle>
          <CardDescription>
            Upload multiple images to generate a PDF with each image on a separate page. Each page will include the
            image filename as a title and a "Cleide Fotos" watermark.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">
              {isDragActive ? "Drop the images here" : "Drag & drop images here, or click to select"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Supported formats: JPEG, JPG, PNG</p>
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Selected Images ({files.length})</h3>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-3">
                      <FileImage className="w-5 h-5 text-primary" />
                      <div className="truncate max-w-[200px] sm:max-w-[400px]">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating PDF...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={handleGeneratePDF}
            disabled={files.length === 0 || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileCheck className="mr-2 h-5 w-5" />
                Generate PDF
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
