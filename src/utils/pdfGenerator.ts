// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ESGFormData, ESGData } from '@/types/esg';

// A map to associate metrics with their units
const metricUnits: Partial<Record<keyof ESGData, string>> = {
    totalElectricityConsumption: 'kWh',
    renewableElectricityConsumption: 'kWh',
    totalFuelConsumption: 'liters',
    carbonEmissions: 'T CO2e',
    averageTrainingHours: 'hrs/yr',
    communityInvestment: 'INR',
    independentBoardMembers: '%',
    totalRevenue: 'INR',
    carbonIntensity: 'T CO2e/INR',
    renewableElectricityRatio: '%',
    diversityRatio: '%',
    communitySpendRatio: '%',
};

// Helper function to format values and append units
const formatValueWithUnit = (key: keyof ESGData, value: any): string => {
    if (value === null || value === undefined) return '-';

    let formattedValue: string;
    if (typeof value === 'boolean') {
        formattedValue = value ? 'Yes' : 'No';
    } else if (typeof value === 'number') {
        if (value.toString().includes('.') && Math.abs(value) < 1 && value !== 0) {
            formattedValue = value.toFixed(6);
        } else {
            formattedValue = Number.isInteger(value) ? value.toString() : value.toFixed(2);
        }
    } else {
        formattedValue = value.toString();
    }

    // Append unit if it exists and the value is not a placeholder
    const unit = metricUnits[key];
    return unit && formattedValue !== '-' && typeof value !== 'boolean' ? `${formattedValue} ${unit}` : formattedValue;
};


export const generatePDF = (esgData: ESGFormData) => {
    const doc = new jsPDF();
    const sortedYears = Object.keys(esgData).map(Number).sort((a, b) => a - b);
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const colors = {
        primary: '#16A085', // Rich green
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
    };

    // --- Reusable Header and Footer ---
    const addHeader = (docInstance: jsPDF) => {
        docInstance.setFontSize(16);
        docInstance.setFont('helvetica', 'bold');
        docInstance.setTextColor(colors.primary);
        docInstance.text('Oren ESG Platform', 14, 15);
        docInstance.setDrawColor(colors.primary);
        docInstance.line(14, 18, 196, 18);
    };

    const addFooter = (docInstance: jsPDF) => {
        const pageNumber = (docInstance as any).internal.getNumberOfPages();
        docInstance.setFontSize(8);
        docInstance.setTextColor(colors.textSecondary);
        docInstance.text(`Page ${pageNumber}`, 196, 285, { align: 'right' });
        docInstance.text(`ESG Summary Report | Generated on ${today}`, 14, 285);
    };

    // --- Page 1: Title and Transposed Executive Summary ---
    addHeader(doc);

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.textPrimary);
    doc.text('ESG Summary Report', 105, 45, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textSecondary);
    const introText = 'An overview of key performance indicators and detailed metrics across all reported financial years.';
    const splitIntro = doc.splitTextToSize(introText, 182);
    doc.text(splitIntro, 105, 55, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.textPrimary);
    doc.text('Year-Over-Year Performance', 14, 80);

    // Transposed Table: Years on Y-axis, Metrics on X-axis
    const summaryMetrics: (keyof ESGData)[] = ['carbonIntensity', 'renewableElectricityRatio', 'diversityRatio', 'communitySpendRatio'];
    const summaryHead = ['Financial Year', 'Carbon Intensity', 'Renewable Ratio', 'Diversity Ratio', 'Community Spend'];
    const summaryBody = sortedYears.map(year => [
        `FY ${year}`,
        ...summaryMetrics.map(metric => formatValueWithUnit(metric, esgData[year][metric]))
    ]);

    autoTable(doc, {
        startY: 85,
        head: [summaryHead],
        body: summaryBody,
        theme: 'grid',
        headStyles: { fillColor: colors.primary, fontStyle: 'bold' },
        columnStyles: { 0: { fontStyle: 'bold' } },
        didDrawPage: (data) => {
            if (data.pageNumber === 1) addHeader(doc);
            addFooter(doc);
        },
    });

    addFooter(doc);

    // --- Subsequent Pages: Detailed Yearly Reports ---
    sortedYears.forEach((year) => {
        doc.addPage();
        addHeader(doc);
        const yearData = esgData[year];
        let startY = 30;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.textPrimary);
        doc.text(`Detailed Report for Financial Year: ${year}`, 14, startY);
        startY += 12;

        const createSectionTable = (title: string, metrics: Array<[string, keyof ESGData]>) => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.textPrimary);
            doc.text(title, 14, startY);

            autoTable(doc, {
                startY: startY + 2, // Position table just below the title
                head: [['Metric', 'Value']],
                body: metrics.map(([label, key]) => [label, formatValueWithUnit(key, yearData[key])]),
                theme: 'grid',
                headStyles: { fillColor: colors.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 90 }, 1: { cellWidth: 'auto' } },
                didDrawPage: () => addFooter(doc),
            });
            // @ts-ignore
            startY = doc.lastAutoTable.finalY + 12;
        };

        createSectionTable('Environmental', [
            ['Total Electricity Consumption', 'totalElectricityConsumption'],
            ['Renewable Electricity Consumption', 'renewableElectricityConsumption'],
            ['Total Fuel Consumption', 'totalFuelConsumption'],
            ['Carbon Emissions', 'carbonEmissions'],
        ]);

        createSectionTable('Social', [
            ['Total Number of Employees', 'totalEmployees'],
            ['Number of Female Employees', 'femaleEmployees'],
            ['Average Training Hours per Employee', 'averageTrainingHours'],
            ['Community Investment Spend', 'communityInvestment'],
        ]);

        createSectionTable('Governance', [
            ['% of Independent Board Members', 'independentBoardMembers'],
            ['Data Privacy Policy', 'hasDataPrivacyPolicy'],
            ['Total Revenue', 'totalRevenue'],
        ]);

        createSectionTable('Auto-Calculated Metrics', [
            ['Carbon Intensity', 'carbonIntensity'],
            ['Renewable Electricity Ratio', 'renewableElectricityRatio'],
            ['Diversity Ratio', 'diversityRatio'],
            ['Community Spend Ratio', 'communitySpendRatio'],
        ]);
    });

    doc.save('ESG_Summary_Report.pdf');
};