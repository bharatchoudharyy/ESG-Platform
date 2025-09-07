// src/utils/generatePdf.ts
// 1. Import necessary modules
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ESGData } from "@/types/esg"; // Import ESGData type

/**
 * Generates a PDF from the Summary page content and triggers a download.
 * Attempts to capture charts using html2canvas and draws the data table manually.
 * @param chartElements An array of HTMLDivElement elements containing the charts.
 * @param esgData The ESG data object ({ [year: number]: ESGData }).
 * @param filename The desired filename for the downloaded PDF.
 */
export async function generateAndDownloadPdf(
    chartElements: HTMLDivElement[], // 2. Accept chart elements directly
    esgData: { [year: number]: ESGData },
    filename: string = "ESG_Summary_Report.pdf"
) {
    try {
        // --- PDF Setup ---
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;
        let currentY = margin;

        // --- Add Title ---
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        const title = "ESG Summary Report";
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, (pageWidth - titleWidth) / 2, currentY);
        currentY += 10;

        // --- Add Subtitle ---
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const subtitle = `Generated on: ${new Date().toLocaleDateString()}`;
        const subtitleWidth = doc.getTextWidth(subtitle);
        doc.text(subtitle, (pageWidth - subtitleWidth) / 2, currentY);
        currentY += 15;

        // --- Add Charts ---
        // 3. Loop through chart elements and add them to the PDF
        if (chartElements && chartElements.length > 0) {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Calculated Metrics Trends", margin, currentY);
            currentY += 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");

            for (let i = 0; i < chartElements.length; i++) {
                const element = chartElements[i];
                if (!element) {
                    doc.text(`Chart ${i + 1} container not found.`, margin, currentY);
                    currentY += 10;
                    continue;
                }

                // Check if we need a new page before adding the chart attempt
                if (currentY > pageHeight - 100) {
                    doc.addPage();
                    currentY = margin;
                }

                try {
                    // 4. Use html2canvas to capture the specific chart element
                    // Add a small delay to ensure chart is fully rendered?
                    // await new Promise(resolve => setTimeout(resolve, 100));
                    const canvas = await html2canvas(element, {
                        scale: 2,
                        useCORS: true,
                        logging: false, // Set to true for debugging html2canvas issues
                        allowTaint: true, // Allow cross-origin images (if any) and bypass some CSS parsing errors
                        // foreignObjectRendering: false, // Try this if allowTaint alone doesn't work
                    });

                    const imgData = canvas.toDataURL("image/png");
                    const imgWidth = canvas.width;
                    const imgHeight = canvas.height;

                    // Calculate dimensions to fit within content width, maintaining aspect ratio
                    const chartDisplayWidth = contentWidth;
                    const chartDisplayHeight = (imgHeight * chartDisplayWidth) / imgWidth;

                    // Add the captured chart image to the PDF
                    doc.addImage(imgData, "PNG", margin, currentY, chartDisplayWidth, chartDisplayHeight);
                    currentY += chartDisplayHeight + 10; // Move Y position down after chart

                    // Add a page break after every 2 charts or if the next chart won't fit
                    if ((i + 1) % 2 === 0 || (i < chartElements.length - 1 && currentY > pageHeight - 100)) {
                        doc.addPage();
                        currentY = margin;
                    }
                } catch (canvasError: any) {
                    console.error(`Error capturing chart ${i + 1}:`, canvasError);
                    doc.text(`Chart ${i + 1} could not be rendered. Error: ${canvasError?.message?.substring(0, 50) ?? 'Unknown'}`, margin, currentY);
                    currentY += 10;
                    // Continue to the next chart even if one fails
                }
            }
        } else {
            doc.text("No charts available to display.", margin, currentY);
            currentY += 10;
        }

        // --- Add Raw Data Section ---
        if (currentY > pageHeight - 50) {
            doc.addPage();
            currentY = margin;
        }
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Questionnaire Data", margin, currentY);
        currentY += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // Prepare data for Raw Data Table
        const years = Object.keys(esgData).map(Number).sort((a, b) => a - b);
        if (years.length > 0) {
            // 5. Simplified and more robust column definitions
            const columns = [
                { header: "Year", dataKey: "year", width: 15 },
                { header: "Total Elec. (kWh)", dataKey: "totalElectricityConsumption", width: 22 },
                { header: "Renew. Elec. (kWh)", dataKey: "renewableElectricityConsumption", width: 22 },
                { header: "Total Fuel (L)", dataKey: "totalFuelConsumption", width: 20 },
                { header: "Carbon (T CO2e)", dataKey: "carbonEmissions", width: 25 },
                { header: "Total Emp.", dataKey: "totalEmployees", width: 18 },
                { header: "Female Emp.", dataKey: "femaleEmployees", width: 18 },
                { header: "Avg. Train. Hrs.", dataKey: "averageTrainingHours", width: 22 },
                { header: "Community Spend (INR)", dataKey: "communityInvestment", width: 35 },
                { header: "Ind. Board (%)", dataKey: "independentBoardMembers", width: 20 },
                { header: "Data Privacy", dataKey: "dataPrivacyPolicy", width: 20 }, // Handle Yes/No
                { header: "Total Revenue (INR)", dataKey: "totalRevenue", width: 35 },
            ];

            // Prepare table body data using the column definitions
            const tableData: any[] = [];
            years.forEach(year => {
                const data = esgData[year];
                const rowData: any = { year: year };
                columns.forEach(col => {
                    if (col.dataKey === 'dataPrivacyPolicy') {
                        // Special handling for Yes/No
                        rowData[col.dataKey] = data?.hasDataPrivacyPolicy === true ? 'Yes' : data?.hasDataPrivacyPolicy === false ? 'No' : '-';
                    } else if (col.dataKey !== 'year') {
                        // Handle other data fields
                        rowData[col.dataKey] = data?.[col.dataKey as keyof ESGData]?.toString() ?? '-';
                    }
                    // 'year' is already set
                });
                tableData.push(rowData);
            });

            // --- Draw Raw Data Table using jspdf's cell drawing for better control ---
            const rowHeight = 10;
            let tableY = currentY;
            const headerY = tableY;

            // Draw headers
            doc.setFont("helvetica", "bold");
            let headerX = margin;
            columns.forEach(col => {
                doc.setFillColor(240, 240, 240); // Light gray background for headers
                doc.rect(headerX, headerY, col.width, rowHeight, 'F'); // Fill header cell
                doc.setTextColor(0, 0, 0); // Black text
                // Center text in header cell
                const textWidth = doc.getTextWidth(col.header);
                const textX = headerX + (col.width - textWidth) / 2;
                doc.text(col.header, textX, headerY + 7); // +7 to align text vertically in cell
                headerX += col.width;
            });
            doc.setFont("helvetica", "normal");
            tableY += rowHeight;

            // Draw body rows
            tableData.forEach((row, rowIndex) => {
                // Check for page break before drawing the row
                if (tableY > pageHeight - rowHeight - margin) {
                    // Simple approach: just add a new page. For headers on new page, more logic needed.
                    doc.addPage();
                    tableY = margin;
                    // Re-draw headers on new page (optional but good for multi-page tables)
                    let newHeaderX = margin;
                    doc.setFont("helvetica", "bold");
                    columns.forEach(col => {
                        doc.setFillColor(240, 240, 240);
                        doc.rect(newHeaderX, tableY, col.width, rowHeight, 'F');
                        doc.setTextColor(0, 0, 0);
                        const textWidth = doc.getTextWidth(col.header);
                        const textX = newHeaderX + (col.width - textWidth) / 2;
                        doc.text(col.header, textX, tableY + 7);
                        newHeaderX += col.width;
                    });
                    doc.setFont("helvetica", "normal");
                    tableY += rowHeight;
                }

                let rowX = margin;
                columns.forEach(col => {
                    const cellValue = row[col.dataKey];
                    doc.setTextColor(0, 0, 0); // Ensure black text for data
                    // Left-align text in data cells
                    doc.text(cellValue, rowX + 2, tableY + 7); // +2 for left padding
                    // Draw cell border
                    doc.setFillColor(255, 255, 255); // White background for data cells (optional, default is transparent)
                    doc.rect(rowX, tableY, col.width, rowHeight); // Stroke only, no fill ('S' is default)
                    rowX += col.width;
                });
                tableY += rowHeight;
            });

            currentY = tableY + 10; // Update Y position after table
        } else {
            doc.text("No questionnaire data available.", margin, currentY);
            currentY += 10;
        }

        // --- Save PDF ---
        doc.save(filename);
        console.log("PDF generated and download triggered using html2canvas for charts and improved jsPDF table logic.");
    } catch (error: any) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while generating the PDF. Please try again.");
    }
}