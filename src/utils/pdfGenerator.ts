// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ESGFormData, ESGData } from '@/types/esg';

const colors = {
    primary: '#16A085',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
};

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

const formatValueWithUnit = (key: keyof ESGData, value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    let formattedValue: string;
    if (typeof value === 'number') {
        if (value.toString().includes('.') && Math.abs(value) < 1 && value !== 0) {
            formattedValue = value.toFixed(6);
        } else {
            formattedValue = Number.isInteger(value) ? value.toString() : value.toFixed(2);
        }
    } else {
        formattedValue = value.toString();
    }
    const unit = metricUnits[key];
    return unit ? `${formattedValue} ${unit}` : formattedValue;
};

const addHeader = (doc: jsPDF) => {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary);
    doc.text('Oren ESG Platform', 14, 15);
    doc.setDrawColor(colors.primary);
    doc.line(14, 18, 196, 18);
};

const addFooter = (doc: jsPDF) => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const pageNumber = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(colors.textSecondary);
    doc.text(`Page ${pageNumber}`, 196, 285, { align: 'right' });
    doc.text(`ESG Summary Report | Generated on ${today}`, 14, 285);
};

// --- Per-Year PDF Generator ---
export const generatePerYearPDF = (yearData: ESGData, year: number) => {
    const doc = new jsPDF();

    // Header
    addHeader(doc);

    // Title 
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.textPrimary);
    doc.text(`ESG Report for FY ${year}`, 105, 30, { align: 'center' });

    let startY = 45;

    const createSectionTable = (title: string, metrics: Array<{ label: string; key: keyof ESGData }>) => {
        // @ts-ignore
        const previousY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 0;
        if (startY < previousY) startY = previousY + 12;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.textPrimary);
        doc.text(title, 14, startY);

        autoTable(doc, {
            startY: startY + 2,
            head: [['Metric', 'Value']],
            body: metrics.map(m => [m.label, formatValueWithUnit(m.key, yearData[m.key])]),
            theme: 'grid',
            headStyles: { fillColor: colors.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 90 },
                1: { cellWidth: 'auto' }
            },
            tableWidth: 'auto',
            didDrawPage: () => addFooter(doc),
        });

        // @ts-ignore
        startY = doc.lastAutoTable.finalY + 12;
    };

    const sections = {
        'Environmental': [
            { label: 'Total Electricity Consumption', key: 'totalElectricityConsumption' },
            { label: 'Renewable Electricity Consumption', key: 'renewableElectricityConsumption' },
            { label: 'Total Fuel Consumption', key: 'totalFuelConsumption' },
            { label: 'Carbon Emissions', key: 'carbonEmissions' },
        ],
        'Social': [
            { label: 'Total Number of Employees', key: 'totalEmployees' },
            { label: 'Number of Female Employees', key: 'femaleEmployees' },
            { label: 'Average Training Hours per Employee', key: 'averageTrainingHours' },
            { label: 'Community Investment Spend', key: 'communityInvestment' },
        ],
        'Governance': [
            { label: '% of Independent Board Members', key: 'independentBoardMembers' },
            { label: 'Data Privacy Policy', key: 'hasDataPrivacyPolicy' },
            { label: 'Total Revenue', key: 'totalRevenue' },
        ],
        'Auto-Calculated Metrics': [
            { label: 'Carbon Intensity', key: 'carbonIntensity' },
            { label: 'Renewable Electricity Ratio', key: 'renewableElectricityRatio' },
            { label: 'Diversity Ratio', key: 'diversityRatio' },
            { label: 'Community Spend Ratio', key: 'communitySpendRatio' },
        ]
    };

    Object.entries(sections).forEach(([title, metrics]) => createSectionTable(title, metrics as any));

    addFooter(doc);
    doc.save(`ESG_Report_FY${year}.pdf`);
};

// --- Cumulative PDF Generator  ---
export const generateCumulativePDF = (esgData: ESGFormData) => {
    const doc = new jsPDF();
    const sortedYears = Object.keys(esgData).map(Number).sort((a, b) => b - a);

    const addHeaderAndFooter = (docInstance: jsPDF) => {
        addHeader(docInstance);
        addFooter(docInstance);
    };

    // --- Page 1: Title and Transposed Executive Summary ---
    addHeader(doc);

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.textPrimary);
    doc.text('Cumulative ESG Summary Report', 105, 45, { align: 'center' });

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

    const summaryMetrics: { label: string, key: keyof ESGData }[] = [
        { label: 'Carbon Intensity', key: 'carbonIntensity' },
        { label: 'Renewable Ratio', key: 'renewableElectricityRatio' },
        { label: 'Diversity Ratio', key: 'diversityRatio' },
        { label: 'Community Spend', key: 'communitySpendRatio' }
    ];

    const summaryHead = ['Financial Year', ...summaryMetrics.map(m => m.label)];
    const summaryBody = sortedYears.map(year => [
        `FY ${year}`,
        ...summaryMetrics.map(metric => formatValueWithUnit(metric.key, esgData[year][metric.key]))
    ]);

    autoTable(doc, {
        startY: 85,
        head: [summaryHead],
        body: summaryBody,
        theme: 'grid',
        headStyles: { fillColor: colors.primary, fontStyle: 'bold' },
        columnStyles: { 0: { fontStyle: 'bold' } },
        didDrawPage: () => addHeaderAndFooter(doc),
    });

    addFooter(doc);

    // --- Subsequent Pages: Detailed Yearly Reports ---
    sortedYears.forEach((year) => {
        doc.addPage();
        addHeaderAndFooter(doc);
        const yearData = esgData[year];
        let startY = 30;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.textPrimary);
        doc.text(`Detailed Report for Financial Year: ${year}`, 14, startY);
        startY += 12;

        const createSectionTable = (title: string, metrics: Array<{ label: string; key: keyof ESGData }>) => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.textPrimary);
            doc.text(title, 14, startY);

            autoTable(doc, {
                startY: startY + 2,
                head: [['Metric', 'Value']],
                body: metrics.map(m => [m.label, formatValueWithUnit(m.key, yearData[m.key])]),
                theme: 'grid',
                headStyles: { fillColor: colors.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 90 }, 1: { cellWidth: 'auto' } },
                didDrawPage: () => addHeaderAndFooter(doc),
            });
            // @ts-ignore
            startY = doc.lastAutoTable.finalY + 12;
        };

        const sections = {
            'Environmental': [
                { label: 'Total Electricity Consumption', key: 'totalElectricityConsumption' },
                { label: 'Renewable Electricity Consumption', key: 'renewableElectricityConsumption' },
                { label: 'Total Fuel Consumption', key: 'totalFuelConsumption' },
                { label: 'Carbon Emissions', key: 'carbonEmissions' },
            ],
            'Social': [
                { label: 'Total Number of Employees', key: 'totalEmployees' },
                { label: 'Number of Female Employees', key: 'femaleEmployees' },
                { label: 'Average Training Hours per Employee', key: 'averageTrainingHours' },
                { label: 'Community Investment Spend', key: 'communityInvestment' },
            ],
            'Governance': [
                { label: '% of Independent Board Members', key: 'independentBoardMembers' },
                { label: 'Data Privacy Policy', key: 'hasDataPrivacyPolicy' },
                { label: 'Total Revenue', key: 'totalRevenue' },
            ],
            'Auto-Calculated Metrics': [
                { label: 'Carbon Intensity', key: 'carbonIntensity' },
                { label: 'Renewable Electricity Ratio', key: 'renewableElectricityRatio' },
                { label: 'Diversity Ratio', key: 'diversityRatio' },
                { label: 'Community Spend Ratio', key: 'communitySpendRatio' },
            ]
        };

        Object.entries(sections).forEach(([title, metrics]) => createSectionTable(title, metrics as { label: string, key: keyof ESGData }[]));
    });

    doc.save('ESG_Cumulative_Report.pdf');
};
