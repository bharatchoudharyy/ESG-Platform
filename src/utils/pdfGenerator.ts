// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ESGFormData, ESGData } from '@/types/esg';

interface PDFGeneratorOptions {
    esgData: ESGFormData;
    userName?: string;
    companyName?: string;
}

/**
 * Formats a boolean value for display
 */
const formatYesNo = (value: boolean | null | undefined): string => {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return '-';
};

/**
 * Formats a number with proper null handling
 */
const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return value.toString();
};

/**
 * Formats a percentage value
 */
const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(2)}%`;
};

/**
 * Generates a PDF document with ESG summary data
 */
export const generateESGPDF = async (options: PDFGeneratorOptions): Promise<void> => {
    const { esgData, userName = 'User', companyName = 'Company' } = options;

    // Initialize jsPDF (A4 size, portrait orientation)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };

    // Add header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ESG Summary Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Add subtitle with date
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Add a separator line
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Section 1: Overview
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overview', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const years = Object.keys(esgData).map(Number).sort((a, b) => b - a);
    pdf.text(`Reporting Years: ${years.join(', ')}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Total Years Tracked: ${years.length}`, margin, yPosition);
    yPosition += 15;

    // Section 2: Calculated Metrics Summary
    checkPageBreak(40);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Performance Indicators', margin, yPosition);
    yPosition += 10;

    // Get latest year data for KPIs
    const latestYear = years[0];
    const latestData = esgData[latestYear];

    if (latestData) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        // Create a simple KPI table
        const kpiData = [
            ['Metric', `FY ${latestYear}`, 'Status'],
            ['Carbon Intensity (T CO2e/INR)', formatNumber(latestData.carbonIntensity), ''],
            ['Renewable Electricity Ratio', formatPercentage(latestData.renewableElectricityRatio), ''],
            ['Diversity Ratio', formatPercentage(latestData.diversityRatio), ''],
            ['Community Spend Ratio', formatPercentage(latestData.communitySpendRatio), '']
        ];

        // Draw KPI table
        const cellHeight = 8;
        const colWidths = [80, 50, 30];
        let tableY = yPosition;

        kpiData.forEach((row, rowIndex) => {
            let xPos = margin;
            row.forEach((cell, colIndex) => {
                // Draw cell border
                pdf.rect(xPos, tableY, colWidths[colIndex], cellHeight);

                // Add cell text
                if (rowIndex === 0) {
                    pdf.setFont('helvetica', 'bold');
                } else {
                    pdf.setFont('helvetica', 'normal');
                }
                pdf.text(cell, xPos + 2, tableY + 5);
                xPos += colWidths[colIndex];
            });
            tableY += cellHeight;
        });

        yPosition = tableY + 10;
    }

    // Section 3: Environmental Data
    checkPageBreak(60);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Environmental Metrics', margin, yPosition);
    yPosition += 8;

    years.forEach(year => {
        checkPageBreak(30);
        const data = esgData[year] || {};

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`FY ${year}`, margin, yPosition);
        yPosition += 6;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        const envData = [
            `Total Electricity Consumption: ${formatNumber(data.totalElectricityConsumption)} kWh`,
            `Renewable Electricity: ${formatNumber(data.renewableElectricityConsumption)} kWh`,
            `Total Fuel Consumption: ${formatNumber(data.totalFuelConsumption)} liters`,
            `Carbon Emissions: ${formatNumber(data.carbonEmissions)} T CO2e`
        ];

        envData.forEach(line => {
            pdf.text(line, margin + 5, yPosition);
            yPosition += 5;
        });
        yPosition += 5;
    });

    // Section 4: Social Data
    checkPageBreak(60);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Social Metrics', margin, yPosition);
    yPosition += 8;

    years.forEach(year => {
        checkPageBreak(30);
        const data = esgData[year] || {};

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`FY ${year}`, margin, yPosition);
        yPosition += 6;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        const socialData = [
            `Total Employees: ${formatNumber(data.totalEmployees)}`,
            `Female Employees: ${formatNumber(data.femaleEmployees)}`,
            `Average Training Hours: ${formatNumber(data.averageTrainingHours)}`,
            `Community Investment: INR ${formatNumber(data.communityInvestment)}`
        ];

        socialData.forEach(line => {
            pdf.text(line, margin + 5, yPosition);
            yPosition += 5;
        });
        yPosition += 5;
    });

    // Section 5: Governance Data
    checkPageBreak(60);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Governance Metrics', margin, yPosition);
    yPosition += 8;

    years.forEach(year => {
        checkPageBreak(25);
        const data = esgData[year] || {};

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`FY ${year}`, margin, yPosition);
        yPosition += 6;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        const govData = [
            `Independent Board Members: ${formatNumber(data.independentBoardMembers)}%`,
            `Data Privacy Policy: ${formatYesNo(data.hasDataPrivacyPolicy)}`,
            `Total Revenue: INR ${formatNumber(data.totalRevenue)}`
        ];

        govData.forEach(line => {
            pdf.text(line, margin + 5, yPosition);
            yPosition += 5;
        });
        yPosition += 5;
    });

    // Add footer to all pages
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // Save the PDF
    pdf.save(`ESG_Summary_Report_${new Date().getTime()}.pdf`);
};

/**
 * Captures charts as images and adds them to PDF
 */
export const generateESGPDFWithCharts = async (
    options: PDFGeneratorOptions,
    chartContainerIds: string[]
): Promise<void> => {
    const { esgData } = options;

    // Initialize jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };

    // Add header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ESG Summary Report with Charts', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Add date
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Capture and add charts
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Performance Trends', margin, yPosition);
    yPosition += 10;

    // Capture each chart
    for (const chartId of chartContainerIds) {
        const chartElement = document.getElementById(chartId);
        if (chartElement) {
            try {
                checkPageBreak(80); // Ensure space for chart

                const canvas = await html2canvas(chartElement, {
                    scale: 2,
                    logging: false,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - (2 * margin);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // Add chart image
                pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 10;
            } catch (error) {
                console.error(`Error capturing chart ${chartId}:`, error);
            }
        }
    }

    // Add the rest of the data (questionnaire data)
    // Use the same logic as in generateESGPDF for adding text data
    // ... (include the same sections as above)

    // Save the PDF
    pdf.save(`ESG_Summary_Report_Charts_${new Date().getTime()}.pdf`);
};