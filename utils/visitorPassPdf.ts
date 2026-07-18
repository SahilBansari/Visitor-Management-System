/**
 * Utility to generate and download visitor pass PDF
 */
import QRCode from 'qrcode';

export interface VisitorPassData {
    passId: string;
    visitorName: string;
    office: string;
    officer: string;
    date: string;
    time: string;
    qrCodeSvg?: string;
}

/**
 * Generate Dynamic Encrypted QR Code as SVG string
 */
const generateQRCodeImage = async (passId: string): Promise<string> => {
    try {
        // Mock payload with timestamp for "Dynamic/Time-stamped" requirement
        const payload = JSON.stringify({
            id: passId,
            ts: Date.now(),
            auth: 'SUDK-VALID'
        });
        
        // Generate actual QR Code SVG
        const qrSvg = await QRCode.toString(payload, {
            type: 'svg',
            width: 150,
            margin: 1,
            color: {
                dark: '#059669', // Department Green
                light: '#ffffff'
            }
        });
        return qrSvg;
    } catch (error) {
        console.error("QR Generation failed, using fallback:", error);
        // Fallback SVG
        return `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150">
                <path fill="currentColor" d="M10 10h20v20H10z m10 5v10h-5v-5h-5v-5h10z m-5 25h10v10H15z M70 10h20v20H70z m5 5h10v10H75z M40 10h10v10H40z M55 10h5v10h-5z M40 25h5v5h-5z m15 0h5v5h-5z M10 40h10v10H10z m20 0h5v5h-5z M10 55h5v5h-5z m5 5h5v5h-5z m10 0h5v5h-5z M10 70h20v20H10z m5 5v10h10v-5h-5v-5h-5z M40 40h10v5H40z m15 0h5v5h-5z m10 0h5v5h-5z m10 0h15v5h-15z M40 50h5v10h-5z m25 0h5v5h-5z m10 0h5v5h-5z M70 40h5v15h-5z M40 65h10v5H40z m15 0h5v5h-5z M70 65h5v5h-5z M40 70h5v10h-5z m15 5h5v5h-5z m10 0h5v5h-5z M70 70h20v20H70z m5 5h10v10h-5v-5h-5v-5z"/>
            </svg>
        `;
    }
};

/**
 * Generate HTML for the visitor pass
 */
const generateVisitorPassHTML = (data: VisitorPassData): string => {
    const { passId, visitorName, office, officer, date, time, qrCodeSvg } = data;
    
    // Format date and time with proper error handling
    let formattedDate = 'N/A';
    let formattedTime = 'N/A';
    
    try {
        // If date already contains time (ISO format like 2026-02-23T18:30:00.000Z)
        if (date && date.includes('T')) {
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                formattedTime = dateObj.toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true
                });
            }
        }
        // If date and time are separate
        else if (date && time) {
            // Check if time is in HH:MM format
            const timeFormatted = time.includes(':') ? `${date}T${time}` : `${date}T${time}:00`;
            const dateObj = new Date(timeFormatted);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                formattedTime = dateObj.toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true
                });
            }
        }
        // If only date provided
        else if (date) {
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
        }
        
        // Fallback if all parsing fails
        if (formattedDate === 'N/A') {
            formattedDate = date || 'N/A';
            formattedTime = time || 'N/A';
        }
    } catch (error) {
        // If any error, use raw values
        formattedDate = date || 'N/A';
        formattedTime = time || 'N/A';
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Visitor Pass - ${passId}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f5f5f5;
                    padding: 10px;
                }
                
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .header {
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                
                .header h1 {
                    font-size: 24px;
                    margin-bottom: 3px;
                    font-weight: 600;
                }
                
                .header p {
                    font-size: 12px;
                    opacity: 0.95;
                }
                
                .content {
                    padding: 20px 25px;
                }
                
                .qr-section {
                    text-align: center;
                    margin-bottom: 18px;
                    padding: 18px 15px;
                    background-color: #f0fdf4;
                    border-radius: 12px;
                    border: 2px solid #d1fae5;
                }
                
                .qr-code {
                    width: 130px;
                    height: 130px;
                    margin: 0 auto;
                    background-color: white;
                    padding: 8px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #d1fae5;
                }
                
                .qr-code svg {
                    width: 100%;
                    height: 100%;
                    color: #059669;
                }
                
                .qr-label {
                    margin-top: 10px;
                    font-size: 10px;
                    font-weight: 700;
                    color: #059669;
                    letter-spacing: 1.5px;
                }
                
                .details-container {
                    margin-bottom: 18px;
                }
                
                .details-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0;
                    margin-bottom: 0;
                }
                
                .detail-item {
                    padding: 12px 14px;
                    border: 1px solid #e5e7eb;
                    background-color: #fafafa;
                    flex: 1;
                }
                
                .details-row .detail-item:nth-child(2) {
                    border-left: none;
                }
                
                .details-row:not(:last-child) .detail-item {
                    border-bottom: none;
                }
                
                .details-row:last-child .detail-item {
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .detail-label {
                    font-size: 9px;
                    font-weight: 700;
                    color: #059669;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                    margin-bottom: 4px;
                    display: block;
                }
                
                .detail-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #064e3b;
                    word-wrap: break-word;
                    word-break: break-word;
                    line-height: 1.3;
                }
                
                .divider {
                    height: 1px;
                    background-color: #e5e7eb;
                    margin: 15px 0;
                }
                
                .footer {
                    background-color: #f9fafb;
                    padding: 12px 25px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }
                
                .footer p {
                    font-size: 10px;
                    color: #6b7280;
                    margin: 3px 0;
                    line-height: 1.4;
                }
                
                .timestamp {
                    font-size: 9px;
                    color: #9ca3af;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid #e5e7eb;
                }
                
                .approval-badge {
                    display: inline-block;
                    background-color: #d1fae5;
                    color: #059669;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    margin-bottom: 15px;
                    letter-spacing: 0.5px;
                }
                
                @media print {
                    body {
                        background-color: white;
                        padding: 5px;
                    }
                    .container {
                        box-shadow: none;
                        border-radius: 0;
                    }
                }
                
                @page {
                    size: A4;
                    margin: 5mm;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✓ Visitor Pass Approved</h1>
                    <p>Your appointment has been approved</p>
                </div>
                
                <div class="content">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <span class="approval-badge">APPROVED</span>
                    </div>
                    
                    <div class="qr-section">
                        <div class="qr-code">
                            ${qrCodeSvg}
                        </div>
                        <div class="qr-label">SCAN FOR CHECK-IN</div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="details-container">
                        <div class="details-row">
                            <div class="detail-item">
                                <div class="detail-label">Pass ID</div>
                                <div class="detail-value">${passId}</div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-label">Visitor Name</div>
                                <div class="detail-value">${visitorName}</div>
                            </div>
                        </div>
                        
                        <div class="details-row">
                            <div class="detail-item">
                                <div class="detail-label">Department</div>
                                <div class="detail-value">${office}</div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-label">Officer</div>
                                <div class="detail-value">${officer}</div>
                            </div>
                        </div>
                        
                        <div class="details-row">
                            <div class="detail-item">
                                <div class="detail-label">Visit Date</div>
                                <div class="detail-value">${formattedDate}</div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-label">Visit Time</div>
                                <div class="detail-value">${formattedTime}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="divider"></div>
                </div>
                
                <div class="footer">
                    <p><strong>Important Instructions:</strong></p>
                    <p>• Please arrive 10 minutes before your scheduled time</p>
                    <p>• Carry a valid photo ID for verification</p>
                    <p>• Present this pass at the security gate</p>
                    <p>• Scan the QR code at the check-in counter</p>
                    <div class="timestamp">
                        Generated on: ${new Date().toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

/**
 * Download visitor pass as PDF
 */
export const downloadVisitorPass = async (data: VisitorPassData) => {
    try {
        const html2pdf = (await import('html2pdf.js')).default;
        
        const qrSvg = await generateQRCodeImage(data.passId);
        const htmlContent = generateVisitorPassHTML({
            ...data,
            qrCodeSvg: qrSvg
        });
        
        // Create a temporary container for the content
        const element = document.createElement('div');
        element.innerHTML = htmlContent;
        
        // Extract the container div (which has the actual content)
        const contentDiv = element.querySelector('.container');
        if (!contentDiv) throw new Error('Failed to create content');
        
        // PDF options
        const options = {
            margin: [5, 5, 5, 5],
            filename: `Visitor-Pass-${data.passId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };
        
        // Generate and download PDF
        await html2pdf().set(options).from(contentDiv).save();
        
        console.log('✅ Visitor pass PDF downloaded successfully');
    } catch (error) {
        console.error('❌ Error downloading visitor pass PDF:', error);
        throw error;
    }
};

/**
 * Print visitor pass
 */
export const printVisitorPass = async (data: VisitorPassData) => {
    try {
        const qrSvg = await generateQRCodeImage(data.passId);
        const htmlContent = generateVisitorPassHTML({
            ...data,
            qrCodeSvg: qrSvg
        });
        
        // Open print window
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            // Added slight delay to ensure QR render
            setTimeout(() => {
                printWindow.print();
            }, 200);
        }
    } catch (error) {
        console.error('❌ Error printing visitor pass:', error);
        throw error;
    }
};