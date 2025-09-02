// CSV Export Utilities

/**
 * Convert array of objects to CSV format and trigger download
 * @param data - Array of objects to export
 * @param filename - Name of the CSV file
 * @param headers - Optional custom headers mapping
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: { label: string; key: keyof T }[]
): void => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  try {
    // Generate headers
    const csvHeaders = headers 
      ? headers.map(h => h.label)
      : Object.keys(data[0]);

    // Generate rows
    const csvRows = data.map(row => {
      const values = headers
        ? headers.map(h => {
            const value = row[h.key];
            return formatCSVValue(value);
          })
        : Object.values(row).map(formatCSVValue);
      
      return values.join(',');
    });

    // Combine headers and rows
    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    // Create and trigger download
    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export CSV file');
  }
};

/**
 * Format a value for CSV output
 * @param value - Value to format
 * @returns Formatted string value
 */
const formatCSVValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }

  // Convert to string
  let stringValue = String(value);

  // Handle special characters and quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape quotes by doubling them
    stringValue = stringValue.replace(/"/g, '""');
    // Wrap in quotes
    stringValue = `"${stringValue}"`;
  }

  return stringValue;
};

/**
 * Create and trigger CSV file download
 * @param csvContent - CSV content string
 * @param filename - Name of the file
 */
const downloadCSV = (csvContent: string, filename: string): void => {
  // Ensure filename has .csv extension
  const csvFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  // Create blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', csvFilename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Export data as JSON file
 * @param data - Data to export
 * @param filename - Name of the JSON file
 */
export const exportToJSON = <T>(
  data: T,
  filename: string
): void => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const jsonFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
    
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', jsonFilename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    throw new Error('Failed to export JSON file');
  }
};

/**
 * Generate CSV data from array of objects
 * @param data - Array of objects
 * @param headers - Header configuration
 * @returns CSV data as string
 */
export const generateCSVData = <T extends Record<string, any>>(
  data: T[],
  headers?: { label: string; key: keyof T }[]
): string => {
  if (!data || data.length === 0) {
    return '';
  }

  const csvHeaders = headers 
    ? headers.map(h => h.label)
    : Object.keys(data[0]);

  const csvRows = data.map(row => {
    const values = headers
      ? headers.map(h => formatCSVValue(row[h.key]))
      : Object.values(row).map(formatCSVValue);
    
    return values.join(',');
  });

  return [csvHeaders.join(','), ...csvRows].join('\n');
};

/**
 * Copy CSV data to clipboard
 * @param data - Array of objects to copy
 * @param headers - Optional custom headers
 */
export const copyCSVToClipboard = async <T extends Record<string, any>>(
  data: T[],
  headers?: { label: string; key: keyof T }[]
): Promise<void> => {
  try {
    const csvData = generateCSVData(data, headers);
    await navigator.clipboard.writeText(csvData);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw new Error('Failed to copy CSV data to clipboard');
  }
};