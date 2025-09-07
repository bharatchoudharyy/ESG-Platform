// src/utils/generatePdf.ts
// Import necessary types from jspdf
import { jsPDF } from "jspdf";
// Import html2canvas
import html2canvas from "html2canvas";

/**
 * Generates a PDF from an HTML element and triggers a download.
 * @param element The HTML element to capture and convert to PDF.
 * @param filename The desired filename for the downloaded PDF.
 */
export async function generateAndDownloadPdf(element: HTMLElement, filename: string = "ESG_Summary.pdf") {
    try {
        // 1. Use html2canvas to capture the element as a canvas image
        const canvas = await html2canvas(element, {
            scale: 2, // Increase scale for better quality
            useCORS: true, // Important for rendering images from external sources (if any)
            logging: false, // Reduce console logs from html2canvas
        });

        // 2. Get the image data URL from the canvas
        const imgData = canvas.toDataURL("image/png");

        // 3. Get the dimensions of the canvas
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // 4. Calculate the dimensions for the PDF page
        // Standard A4 size in mm
        const pdfWidth = 210;
        const pdfHeight = (imgHeight * pdfWidth) / imgWidth; // Maintain aspect ratio

        // 5. Create a new jsPDF instance (default is A4 portrait)
        const pdf = new jsPDF({
            orientation: pdfHeight > pdfWidth ? "portrait" : "landscape", // Set orientation based on content
            unit: "mm",
            format: "a4",
        });

        // 6. Add the captured image to the PDF
        // Arguments: image data, x-coordinate, y-coordinate, width, height
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        // 7. Save the PDF and trigger download
        pdf.save(filename);

        console.log("PDF generated and download triggered.");
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while generating the PDF. Please try again.");
    }
}