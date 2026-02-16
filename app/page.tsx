"use client"

import { useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileImage, FileCheck, Loader2, Grid3x3, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ImageToPDFConverter() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<{ [key: number]: string }>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [watermarkText, setWatermarkText] = useState("")
  const [imageQuality, setImageQuality] = useState("0.8")
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery")

  useEffect(() => {
    const savedWatermark = localStorage.getItem("watermarkText")
    setWatermarkText(savedWatermark || "Do Not Copy")
  }, [])

  useEffect(() => {
    if (watermarkText) {
      localStorage.setItem("watermarkText", watermarkText)
    }
  }, [watermarkText])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles])
      // Generate previews for new files
      acceptedFiles.forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setPreviews((prev) => {
            const newIndex = files.length + index
            return { ...prev, [newIndex]: result }
          })
        }
        reader.readAsDataURL(file)
      })
    },
  })

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      const newPreviews = { ...prev }
      delete newPreviews[index]
      // Reindex previews after removal
      const reindexed: { [key: number]: string } = {}
      let newIndex = 0
      for (let i = 0; i < files.length; i++) {
        if (i !== index && newPreviews[i]) {
          reindexed[newIndex] = newPreviews[i]
          newIndex++
        }
      }
      return reindexed
    })
  }

  const truncateFilename = (filename: string, maxLength: number = 50): string => {
    if (filename.length <= maxLength) return filename
    return filename.substring(0, maxLength) + "..."
  }

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const resizeImage = (dataUrl: string, maxWidth = 1600, maxHeight = 1200): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)

        resolve(canvas.toDataURL("image/jpeg", Number.parseFloat(imageQuality)))
      }
      img.src = dataUrl
    })
  }

  const addWatermark = (dataUrl: string, text: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")

        ctx?.drawImage(img, 0, 0)

        if (ctx) {
          const fontSize = Math.floor((img.width / text.length) * 1.6)

          ctx.font = `bold ${fontSize}px Arial`
          ctx.fillStyle = "rgba(200, 200, 200, 0.5)"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          ctx.fillText(text, img.width / 2, img.height / 2)
        }

        resolve(canvas.toDataURL("image/jpeg", Number.parseFloat(imageQuality)))
      }
      img.src = dataUrl
    })
  }

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
      const pdfDoc = await PDFDocument.create()

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        setProgress((i / files.length) * 90)

        const dataUrl = await fileToDataUrl(file)

        const resizedDataUrl = await resizeImage(dataUrl)

        const watermarkedDataUrl = await addWatermark(resizedDataUrl, watermarkText)

        const base64Data = watermarkedDataUrl.split(",")[1]
        const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

        const image = await pdfDoc.embedJpg(imageBytes)

        const { width, height } = image.scale(1)
        const page = pdfDoc.addPage([width + 100, height + 150])

        page.drawImage(image, {
          x: 50,
          y: 100,
          width,
          height,
        })

        const fileName = removeFileExtension(file.name)
        const titleFontSize = 28
        const titleWidth = font.widthOfTextAtSize(fileName, titleFontSize)
        page.drawText(fileName, {
          x: (page.getWidth() - titleWidth) / 2,
          y: 50,
          size: titleFontSize,
          font,
          color: rgb(0, 0, 0),
        })
      }

      const pdfBytes = await pdfDoc.save()
      setProgress(100)

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
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
      setFiles([])
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Images to PDF Converter</CardTitle>
          <CardDescription>
            Upload multiple images to generate a PDF with each image on a separate page. Each page will include the
            image filename as a title and a watermark.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="watermark">Watermark Text</Label>
              <Input
                id="watermark"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality">Image Quality</Label>
              <Select value={imageQuality} onValueChange={setImageQuality}>
                <SelectTrigger id="quality">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0">Original (100%)</SelectItem>
                  <SelectItem value="0.9">High (90%)</SelectItem>
                  <SelectItem value="0.8">Medium (80%)</SelectItem>
                  <SelectItem value="0.6">Low (60%)</SelectItem>
                  <SelectItem value="0.4">Very Low (40%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Selected Images ({files.length})</h3>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "gallery" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("gallery")}
                    title="Gallery view"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {viewMode === "gallery" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[800px] overflow-y-auto pr-2">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="relative overflow-hidden rounded-lg bg-muted aspect-square border border-muted-foreground/25">
                        {previews[index] && (
                          <img
                            src={previews[index]}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="mt-2 truncate">
                        <p className="text-xs font-medium truncate" title={file.name}>
                          {truncateFilename(file.name)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-h-[800px] overflow-y-auto space-y-2 pr-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center space-x-3 flex-1">
                        {previews[index] && (
                          <img
                            src={previews[index]}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" title={file.name}>
                            {truncateFilename(file.name)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
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
              )}
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
