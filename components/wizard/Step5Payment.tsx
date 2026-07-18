import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../../App';
import type { FormData } from './RegistrationWizard';
import { visitorService, appointmentService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

interface Step5PaymentProps {
    lang: Language;
    formData: FormData;
    onFinish: () => void;
}

// UPDATED: Added Marathi Content
const content = {
    en: {
        processing: "Processing Request...",
        successTitle: "Appointment Request Submitted!",
        passIdLabel: "Your Request ID",
        scanQr: "Keep this ID safe for tracking status.",
        trackStatus: "Track Status",
        pendingApproval: "Your pass request is waiting for approval.",
        copyId: "Copy Request ID",
        copied: "ID Copied to clipboard!",
        copyIcon: "content_copy"
    },
    hi: {
        processing: "अनुरोध संसाधित किया जा रहा है...",
        successTitle: "अपॉइंटमेंट अनुरोध जमा किया गया!",
        passIdLabel: "आपकी अनुरोध आईडी",
        scanQr: "ट्रैकिंग के लिए इस आईडी को सुरक्षित रखें।",
        trackStatus: "स्थिति ट्रैक करें",
        pendingApproval: "आपका पास अनुरोध मंजूरी के लिए लंबित है।",
        copyId: "आईडी कॉपी करें",
        copied: "आईडी क्लिपबोर्ड पर कॉपी की गई!",
        copyIcon: "content_copy"
    },
    mr: {
        processing: "विनंतीवर प्रक्रिया होत आहे...",
        successTitle: "अपॉइंटमेंट विनंती सादर केली!",
        passIdLabel: "तुमची विनंती आयडी",
        scanQr: "ट्रॅकिंगसाठी हा आयडी सुरक्षित ठेवा.",
        trackStatus: "स्थिती ट्रॅक करा",
        pendingApproval: "तुमची पास विनंती मंजुरीच्या प्रतीक्षेत आहे.",
        copyId: "आयडी कॉपी करा",
        copied: "आयडी क्लिपबोर्डवर कॉपी केला!",
        copyIcon: "content_copy"
    }
}

const QrCodeSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
        <path fill="#212121" d="M10 10h20v20H10z m10 5v10h-5v-5h-5v-5h10z m-5 25h10v10H15z M70 10h20v20H70z m5 5h10v10H75z M40 10h10v10H40z M55 10h5v10h-5z M40 25h5v5h-5z m15 0h5v5h-5z M10 40h10v10H10z m20 0h5v5h-5z M10 55h5v5h-5z m5 5h5v5h-5z m10 0h5v5h-5z M10 70h20v20H10z m5 5v10h10v-5h-5v-5h-5z M40 40h10v5H40z m15 0h5v5h-5z m10 0h5v5h-5z m10 0h15v5h-15z M40 50h5v10h-5z m25 0h5v5h-5z m10 0h5v5h-5z M70 40h5v15h-5z M40 65h10v5H40z m15 0h5v5h-5z M70 65h5v5h-5z M40 70h5v10h-5z m15 5h5v5h-5z m10 0h5v5h-5z M70 70h20v20H70z m5 5h10v10h-5v-5h-5v-5z"/>
    </svg>
);


const Step5Payment: React.FC<Step5PaymentProps> = ({ lang, formData, onFinish }) => {
    const { addNotification } = useNotification();
    const [isProcessing, setIsProcessing] = useState(true);
    const [passId, setPassId] = useState('');
    const [error, setError] = useState('');
    const hasSubmitted = useRef(false);  // ✅ Prevent double submission
    const t = content[lang];

    useEffect(() => {
        // ✅ Prevent double submission in React StrictMode or re-renders
        if (hasSubmitted.current) {
            console.log('⚠️ Submission already in progress, skipping duplicate');
            return;
        }
        hasSubmitted.current = true;

        const submitToBackend = async () => {
            try {
                setIsProcessing(true);
                console.log('📤 Submitting form data to backend...', formData);

                let photoUrl = formData.photoPath || '';  // Use already uploaded photo path
                let documentUrl = formData.idProofPath || '';  // Use already uploaded document path

                // Step 0a: Upload visitor photo to FTP if not already uploaded
                if (formData.photo && !photoUrl) {
                    console.log('📸 Step 0a: Uploading visitor photo to FTP...');
                    try {
                        let blob: Blob;
                        
                        // Check if it's a data URL or a File object
                        if (typeof formData.photo === 'string' && formData.photo.startsWith('data:')) {
                            // Convert data URL to blob
                            const response = await fetch(formData.photo);
                            blob = await response.blob();
                        } else if (formData.photo instanceof Blob) {
                            blob = formData.photo;
                        } else {
                            throw new Error('Invalid photo format');
                        }

                        const file = new File(
                            [blob],
                            `PHOTO_${formData.fullName}_${Date.now()}.jpg`,
                            { type: 'image/jpeg' }
                        );

                        const formDataFTP = new FormData();
                        formDataFTP.append('file', file);
                        formDataFTP.append('uploadPath', '/vms/photos');  // ✅ Explicitly set FTP path
                        formDataFTP.append('category', 'photos');
                        formDataFTP.append('uploadType', 'vms');

                        console.log('📸 Sending photo to FTP /vms/photos/ endpoint...');
                        const uploadRes = await fetch('http://localhost:3001/ftp/upload-local', {
                            method: 'POST',
                            body: formDataFTP
                        });

                        console.log('📸 FTP Response Status:', uploadRes.status);
                        
                        if (uploadRes.ok) {
                            const uploadData = await uploadRes.json();
                            console.log('📸 Upload response:', uploadData);
                            
                            // Get the file path from the response (could be in filePath or data.remotePath)
                            photoUrl = uploadData.filePath || uploadData.data?.remotePath || '';
                            console.log('✅ Photo uploaded to:', photoUrl);
                            
                            if (!photoUrl) {
                                console.warn('⚠️ No photo URL in response, response was:', uploadData);
                            }
                        } else {
                            console.warn('⚠️ Photo upload failed with status:', uploadRes.status);
                            const errorText = await uploadRes.text();
                            console.warn('⚠️ Error details:', errorText);
                        }
                    } catch (err) {
                        console.warn('⚠️ Photo upload error:', err);
                        if (err instanceof Error) {
                            console.warn('⚠️ Error details:', err.message);
                        }
                    }
                } else {
                    console.log('✅ Using already uploaded photo path:', photoUrl || '(none)');
                }

                // Step 0b: Upload ID document to FTP if not already uploaded
                if (formData.idProof && !documentUrl) {
                    console.log('📄 Step 0b: Uploading ID document to FTP /vms/documents/...');
                    try {
                        const formDataFTP = new FormData();
                        formDataFTP.append('file', formData.idProof);
                        formDataFTP.append('uploadPath', '/vms/documents');  // ✅ Explicitly set FTP path
                        formDataFTP.append('category', 'documents');
                        formDataFTP.append('uploadType', 'vms');

                        const uploadRes = await fetch('http://localhost:3001/ftp/upload-local', {
                            method: 'POST',
                            body: formDataFTP
                        });

                        if (uploadRes.ok) {
                            const uploadData = await uploadRes.json();
                            // Get the file path from the response (could be in filePath or data.remotePath)
                            documentUrl = uploadData.filePath || uploadData.data?.remotePath || '';
                            console.log('✅ Document uploaded to:', documentUrl);
                        } else {
                            console.warn('⚠️ Document upload failed, continuing without document');
                        }
                    } catch (err) {
                        console.warn('⚠️ Document upload error:', err);
                    }
                } else {
                    console.log('✅ Using already uploaded document path:', documentUrl || '(none)');
                }

                // Step 1: Create visitor record with FTP URLs
                console.log('📝 Step 1: Creating visitor...');
                console.log('📸 Photo URL to save:', photoUrl);
                console.log('📄 Document URL to save:', documentUrl);
                console.log('📋 FormData photoPath:', formData.photoPath);
                console.log('📋 FormData idProofPath:', formData.idProofPath);
                console.log('📋 FormData photo:', formData.photo ? 'EXISTS' : 'MISSING');
                console.log('📋 FormData idProof:', formData.idProof ? 'EXISTS' : 'MISSING');
                
                const visitorResult = await visitorService.createVisitor({
                    full_name: formData.fullName,
                    visitor_mobile_no: formData.mobile,
                    visitor_email: formData.email || '',
                    visitor_photo_url: photoUrl || null,
                    document_url: documentUrl || null
                });
                console.log('✅ Visitor created with ID:', visitorResult.visitor_id);
                console.log('✅ Visitor data:', visitorResult);

                // Step 2: Parse time slot to get start and end times
                console.log('📝 Step 2: Parsing time slot...');
                const slotMap: { [key: string]: { start: string; end: string } } = {
                    '1': { start: '09:00', end: '09:30' },
                    '2': { start: '09:30', end: '10:00' },
                    '3': { start: '10:00', end: '10:30' },
                    '4': { start: '10:30', end: '11:00' },
                    '5': { start: '11:00', end: '11:30' },
                    '6': { start: '11:30', end: '12:00' },
                    '7': { start: '14:00', end: '14:30' },
                    '8': { start: '14:30', end: '15:00' },
                    '9': { start: '15:00', end: '15:30' },
                    '10': { start: '15:30', end: '16:00' },
                    '11': { start: '16:00', end: '16:30' },
                    '12': { start: '16:30', end: '17:00' }
                };

                const slotTimes = slotMap[formData.timeSlot] || { start: '09:00', end: '09:30' };
                const visitDate = formData.date ? formData.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

                // Step 3: Submit visitor request with photo and document URLs
                console.log('📝 Step 3: Submitting visitor request...');
                console.log('📸 Passing photo URL:', photoUrl);
                console.log('📄 Passing document URL:', documentUrl);
                const requestResult = await visitorService.submitRequest({
                    visitor_name: formData.fullName,
                    visitor_type: formData.userType,
                    mobile_number: formData.mobile,
                    host_name: formData.officer,
                    department: formData.office,
                    visit_date: visitDate,
                    visit_start_time: slotTimes.start,
                    visit_end_time: slotTimes.end,
                    number_of_visitors: Number(formData.visitorCount) || 1,
                    visitor_id: visitorResult.visitor_id,
                    visitor_photo_url: photoUrl || null,
                    document_url: documentUrl || null
                });
                console.log('✅ Visitor request created with Pass ID:', requestResult.pass_id);

                // Dispatch notification for real-time update
                addNotification({
                    title: `New Visit Request: ${formData.fullName}`,
                    time: 'Just now',
                    date: 'Today',
                    isUnread: true,
                    type: 'info',
                    data: {
                        visitorName: formData.fullName,
                        passId: requestResult.pass_id,
                        department: formData.office,
                        officer: formData.officer
                    }
                });

                setPassId(requestResult.pass_id);
                setIsProcessing(false);
            } catch (err) {
                console.error('❌ Error submitting data:', err);
                setError(err instanceof Error ? err.message : 'Failed to submit request');
                setIsProcessing(false);
            }
        };

        submitToBackend();
    }, [formData]);

    const handleCopyId = () => {
        navigator.clipboard.writeText(passId);
        alert(t.copied);
    };

    if (isProcessing) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg font-semibold">{t.processing}</p>
                <p className="mt-2 text-sm text-gray-500">Submitting your request to the database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <span className="material-symbols-outlined text-6xl text-red-600 block mb-4">error_outline</span>
                    <h2 className="text-2xl font-bold text-red-800 mb-2">Error Submitting Request</h2>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button 
                        onClick={onFinish}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="text-center">
            <div className="flex justify-center items-center mb-4">
                 <span className="material-symbols-outlined text-6xl text-success bg-success/10 p-4 rounded-full">check_circle</span>
            </div>
            <h2 className="text-3xl font-heading font-bold text-success mb-4">{t.successTitle}</h2>
            
            <div className="max-w-xs mx-auto bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg my-8">
                <div className="w-full aspect-square p-4 bg-white rounded-lg opacity-50 relative">
                    <QrCodeSvg />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-white/90 px-2 py-1 text-xs font-bold text-neutral-600 rounded border border-neutral-300 transform -rotate-12">PENDING APPROVAL</span>
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">{t.passIdLabel}</p>
                    <p className="text-lg sm:text-xl font-bold font-mono tracking-wider text-primary dark:text-white select-all text-center whitespace-nowrap overflow-hidden text-ellipsis px-2">{passId}</p>
                </div>
                 <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">{t.scanQr}</p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-8 max-w-md mx-auto">
                <div className="flex">
                    <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 mr-3">info</span>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 text-left">
                        {t.pendingApproval}
                    </p>
                </div>
            </div>

             <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
                
                <button 
                    onClick={handleCopyId}
                    className="flex-1 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary/50 text-neutral-700 dark:text-neutral-200 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group" 
                >
                    <span className="material-symbols-outlined text-neutral-400 group-hover:text-primary transition-colors">content_copy</span>
                    {t.copyId}
                </button>

                <button 
                    onClick={onFinish} 
                    className="flex-1 bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/30 hover:shadow-secondary/30 transition-all transform active:scale-95 flex items-center justify-center gap-2" 
                >
                    <span className="material-symbols-outlined">search</span>
                    {t.trackStatus}
                </button>
            </div>
        </div>
    );
};

export default Step5Payment;