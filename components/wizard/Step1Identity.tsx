import React, { useState, useRef, useEffect } from 'react';
import type { Language } from '../../App';
import type { FormData, UserType } from './RegistrationWizard';
import TextInput from '../common/TextInput';
import FaceIdMatch from '../FaceIdMatch/FaceIdMatch';
import PhotoCapture from './PhotoCapture';
import { Dropdown, Option, Button, RadioGroup, Radio, Label, Spinner } from '@fluentui/react-components';

interface Step1IdentityProps {
    lang: Language;
    formData: FormData;
    updateFormData: (field: keyof FormData, value: any) => void;
}

const content = {
    en: {
        title: "Registration Details",
        userType: "I am a:",
        types: {
            visitor: "Visitor",
            vendor: "Vendor",
            officer: "Officer"
        },
        fullName: "Full Name",
        fullNameHint: "As per official records",
        mobile: "Mobile Number",
        email: "Email ID", 
        getOtp: "Get OTP",
        enterOtp: "Enter OTP",
        verify: "Verify",
        verified: "Verified",
        otpSent: "OTP sent to your mobile.",
        invalidOtp: "Invalid OTP",
        idType: "ID Type",
        idNumber: "ID Number",
        idProof: "ID Proof Document",
        idProofHint: "Upload document or take a photo",
        uploadFile: "Upload File",
        takePhoto: "Take Photo",
        photo: "Photograph",
        preview: "Preview",
        remove: "Remove",
        docPreview: "Document Preview",
        scanningId: "Running OCR & Validating ID...",
    },
    hi: {
        title: "पंजीकरण विवरण",
        userType: "मैं एक हूँ:",
        types: {
            visitor: "आगंतुक (Visitor)",
            vendor: "विक्रेता (Vendor)",
            officer: "अधिकारी (Officer)"
        },
        fullName: "पूरा नाम",
        fullNameHint: "आधिकारिक रिकॉर्ड के अनुसार",
        mobile: "मोबाइल नंबर",
        email: "ईमेल आईडी",
        getOtp: "ओटीपी प्राप्त करें",
        enterOtp: "ओटीपी दर्ज करें",
        verify: "सत्यापित करें",
        verified: "सत्यापित",
        otpSent: "ओटीपी आपके मोबाइल पर भेजा गया।",
        invalidOtp: "अमान्य ओटीपी",
        idType: "आईडी का प्रकार",
        idNumber: "आईडी संख्या",
        idProof: "आईडी प्रूफ दस्तावेज़",
        idProofHint: "दस्तावेज़ अपलोड करें या फोटो लें",
        uploadFile: "फाइल अपलोड करें",
        takePhoto: "फोटो लें",
        photo: "तस्वीर",
        preview: "देखें",
        remove: "हटाएं",
        docPreview: "दस्तावेज़ देखें",
        scanningId: "OCR स्कैनिंग और ID सत्यापित की जा रही है...",
    },
    mr: {
        title: "नोंदणी तपशील",
        userType: "मी एक आहे:",
        types: {
            visitor: "अतिथी (Visitor)",
            vendor: "विक्रेता (Vendor)",
            officer: "अधिकारी (Officer)"
        },
        fullName: "पूर्ण नाव",
        fullNameHint: "अधिकृत नोंदीनुसार",
        mobile: "मोबाईल नंबर",
        email: "ईमेल आयडी",
        getOtp: "ओटीपी मिळवा",
        enterOtp: "ओटीपी प्रविष्ट करा",
        verify: "सत्यापित करा",
        verified: "सत्यापित",
        otpSent: "ओटीपी तुमच्या मोबाईलवर पाठवला आहे.",
        invalidOtp: "अवैध ओटीपी",
        idType: "ओळखपत्राचा प्रकार",
        idNumber: "ओळखपत्र क्रमांक",
        idProof: "ओळखपत्र दस्तऐवज",
        idProofHint: "दस्तऐवज अपलोड करा किंवा फोटो काढा",
        uploadFile: "फाइल अपलोड करा",
        takePhoto: "फोटो काढा",
        photo: "छायाचित्र",
        preview: "पूर्वावलोकन",
        remove: "काढून टाका",
        docPreview: "दस्तऐवज पूर्वावलोकन",
        scanningId: "OCR स्कॅनिंग आणि ID पडताळणी करत आहे...",
    }
}

const idOptions = [
    { value: 'aadhaar', label: 'Aadhaar Card' },
    { value: 'visiting_card', label: 'Visiting Card' },
    { value: 'voter', label: 'Voter ID' },
    { value: 'dl', label: 'Driving License' },
    { value: 'passport', label: 'Passport' },
    { value: 'employee_id', label: 'Employee ID' },
];

const Step1Identity: React.FC<Step1IdentityProps> = ({ lang, formData, updateFormData }) => {
    const t = content[lang];
    const [otpSent, setOtpSent] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [otpError, setOtpError] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isScanningId, setIsScanningId] = useState(false);
    const [uploadError, setUploadError] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (formData.idProof) {
            const url = URL.createObjectURL(formData.idProof);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [formData.idProof]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Simulate OCR Scanning before upload
            setIsScanningId(true);
            setTimeout(() => {
                setIsScanningId(false);
                updateFormData('idProof', file);
                
                // MOCK UPLOAD INSTEAD OF FETCH
                uploadIdProofFile(file);
                
                // Mock autofill logic based on OCR
                if (!formData.idNumber) updateFormData('idNumber', 'XXXX-XXXX-1234');
            }, 2500);
        }
    };

    // Upload ID proof file (MOCKED FOR FRONTEND)
    const uploadIdProofFile = async (file: File): Promise<string | null> => {
        return new Promise((resolve) => {
            setUploading(true);
            setUploadError('');
            
            console.log('📄 Starting MOCK document upload to /vms/documents/...');
            
            // Simulate network delay
            setTimeout(() => {
                setUploading(false);
                const mockDocPath = `/mock/documents/${file.name}`;
                updateFormData('idProofPath', mockDocPath);
                console.log('✅ Mock ID proof uploaded to:', mockDocPath);
                resolve(mockDocPath);
            }, 1500);
        });
    };

    const handlePhotoCapture = (file: File) => {
        setIsScanningId(true);
        setTimeout(() => {
            setIsScanningId(false);
            updateFormData('idProof', file);
            setShowCamera(false);
        }, 2000);
    };

    // Upload visitor photo (MOCKED FOR FRONTEND)
    const uploadVisitorPhoto = async (file: File): Promise<string | null> => {
        return new Promise((resolve) => {
            setUploading(true);
            setUploadError('');
            
            console.log('📸 Starting MOCK visitor photo upload to /vms/photos/...');
            
            // Simulate network delay
            setTimeout(() => {
                setUploading(false);
                const mockPhotoPath = `/mock/photos/${file.name}`;
                updateFormData('photoPath', mockPhotoPath);
                console.log('✅ Mock Photo uploaded to:', mockPhotoPath);
                resolve(mockPhotoPath);
            }, 1500);
        });
    };

    const handleRemoveFile = () => {
        updateFormData('idProof', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleGetOtp = () => {
        if (formData.mobile.length < 10) {
            alert(lang === 'mr' ? "कृपया वैध मोबाईल नंबर प्रविष्ट करा." : (lang === 'hi' ? "कृपया एक मान्य मोबाइल नंबर दर्ज करें।" : "Please enter a valid mobile number."));
            return;
        }
        setTimeout(() => {
            setOtpSent(true);
            alert(`DEMO: Your OTP is 1234`);
        }, 500);
    };

    const handleVerifyOtp = () => {
        if (otpInput === '1234') {
            updateFormData('otpVerified', true);
            setOtpError('');
        } else {
            setOtpError(t.invalidOtp);
        }
    };

    return (
        <div>
            {showCamera && (
                <PhotoCapture 
                    onCapture={handlePhotoCapture} 
                    onCancel={() => setShowCamera(false)} 
                    lang={lang} 
                />
            )}

            {isScanningId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center max-w-sm">
                        <Spinner size="large" appearance="primary" />
                        <h3 className="mt-4 font-semibold text-lg text-primary text-center">{t.scanningId}</h3>
                        <p className="text-xs text-neutral-500 mt-2 text-center">Extracting details via SUDK AI Engine...</p>
                    </div>
                </div>
            )}

            {showPreview && previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                             <h3 className="font-semibold text-lg">{t.docPreview}</h3>
                             <button 
                                onClick={() => setShowPreview(false)} 
                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
                             >
                                <span className="material-symbols-outlined text-xl">close</span>
                             </button>
                        </div>
                        <div className="flex-grow p-4 overflow-auto flex items-center justify-center bg-neutral-100">
                            {formData.idProof?.type.startsWith('image/') ? (
                                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded shadow-sm" />
                            ) : (
                                <iframe src={previewUrl} title="PDF Preview" className="w-full h-[70vh] rounded border border-neutral-200" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-heading font-bold text-[#085268] mb-8">{t.title}</h2>
            
            <div className="mb-8">
                <Label size="large" className="block mb-2 font-semibold text-[#085268]">{t.userType}</Label>
                <RadioGroup 
                    layout="horizontal" 
                    value={formData.userType} 
                    onChange={(_, data) => updateFormData('userType', data.value as UserType)}
                    className="flex gap-6 flex-wrap"
                >
                    <Radio value="visitor" label={t.types.visitor} />
                    <Radio value="vendor" label={t.types.vendor} />
                    <Radio value="officer" label={t.types.officer} />
                </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                <div className="space-y-8">
                    <TextInput 
                        label={t.fullName} 
                        value={formData.fullName}
                        onChange={(e) => updateFormData('fullName', e.target.value)}
                        helperText={t.fullNameHint}
                        required
                    />

                    <TextInput 
                        label={t.email}
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        required
                    />

                    <div className="space-y-2">
                         <div className="flex items-end gap-2">
                            <div className="flex-grow">
                                <TextInput 
                                    label={t.mobile}
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={(e) => {
                                        updateFormData('mobile', e.target.value);
                                        updateFormData('otpVerified', false);
                                        setOtpSent(false);
                                    }}
                                    required
                                    disabled={formData.otpVerified}
                                />
                            </div>
                            {!formData.otpVerified ? (
                                <Button appearance="primary" onClick={handleGetOtp} disabled={otpSent || !formData.mobile} style={{height: '44px'}} className="!bg-[#1B7E6C] hover:!bg-[#156152] !rounded-md">
                                    {t.getOtp}
                                </Button>
                            ) : (
                                <Button appearance="outline" disabled style={{height: '44px', borderColor: '#156152', color: '#156152'}} className="!rounded-md">
                                    {t.verified}
                                </Button>
                            )}
                        </div>
                        
                        {otpSent && !formData.otpVerified && (
                            <div className="flex items-end gap-2 mt-2 animate-fadeIn">
                                <div className="flex-grow">
                                     <TextInput 
                                        label={t.enterOtp}
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value)}
                                        placeholder="1234"
                                    />
                                </div>
                                <Button appearance="primary" onClick={handleVerifyOtp} style={{height: '44px'}} className="!bg-[#1B7E6C] hover:!bg-[#156152] !rounded-md">
                                    {t.verify}
                                </Button>
                            </div>
                        )}
                        {otpError && <p className="text-xs text-red-600">{otpError}</p>}
                    </div>

                    <div className="p-5 bg-white rounded-lg border border-neutral-200 shadow-sm space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">{t.idType}</label>
                            <Dropdown
                                aria-label={t.idType}
                                appearance="outline"
                                value={idOptions.find(opt => opt.value === formData.idType)?.label}
                                onOptionSelect={(_, data) => updateFormData('idType', data.optionValue || 'aadhaar')}
                                className="w-full [&>.fui-Dropdown-button]:!bg-white [&>.fui-Dropdown-button]:!border-neutral-300 [&>.fui-Dropdown-button]:!h-11 [&>.fui-Dropdown-button]:shadow-sm [&>.fui-Dropdown-button]:!rounded-md"
                            >
                                {idOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                            </Dropdown>
                        </div>

                        <TextInput 
                            label={t.idNumber} 
                            value={formData.idNumber}
                            onChange={(e) => updateFormData('idNumber', e.target.value)}
                            required
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                {t.idProof} <span className="text-red-600">*</span>
                            </label>
                            
                            {!formData.idProof ? (
                                <div className="flex gap-2">
                                    <Button onClick={() => fileInputRef.current?.click()} appearance="secondary" disabled={uploading || isScanningId} className="bg-white border-neutral-300 text-[#1B7E6C] !h-10">
                                        <span className="material-symbols-outlined text-base mr-2">upload_file</span>
                                        {uploading ? 'Uploading...' : t.uploadFile}
                                    </Button>
                                    <Button onClick={() => setShowCamera(true)} appearance="secondary" disabled={uploading || isScanningId} className="bg-white border-neutral-300 text-[#1B7E6C] !h-10">
                                        <span className="material-symbols-outlined text-base mr-2">photo_camera</span>
                                        {t.takePhoto}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-white border border-neutral-300 rounded-lg shadow-sm">
                                    <span className="material-symbols-outlined text-[#156152] text-3xl">description</span>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate" title={formData.idProof.name}>
                                            {formData.idProof.name}
                                        </p>
                                        <p className="text-xs text-[#156152]">
                                            {(formData.idProof.size / 1024).toFixed(1)} KB
                                            <span className="ml-2 text-green-600 font-semibold bg-green-50 px-1 rounded border border-green-200">✓ OCR Verified</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                         <Button 
                                            appearance="subtle" 
                                            icon={<span className="material-symbols-outlined">visibility</span>} 
                                            onClick={() => setShowPreview(true)} 
                                            title={t.preview}
                                        />
                                         <Button 
                                            appearance="subtle" 
                                            icon={<span className="material-symbols-outlined text-red-500">delete</span>} 
                                            onClick={handleRemoveFile} 
                                            title={t.remove}
                                        />
                                    </div>
                                </div>
                            )}

                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            
                            {!formData.idProof && <p className="text-xs text-[#156152]">{t.idProofHint}</p>}
                            {!formData.idProof && <p className="text-xs text-red-600">Required</p>}
                            {uploadError && <p className="text-xs text-red-600 mt-1">❌ Upload error: {uploadError}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                     <label className="block text-sm font-semibold text-[#085268] mb-3 w-full">{t.photo}</label>
                     <div className="w-full max-w-[250px] md:w-full bg-white p-2 rounded-lg border border-neutral-200 shadow-sm">
                        <FaceIdMatch 
                            onMatch={(score) => console.log("Face matched with score:", score)} 
                            onFail={() => console.log("Face match failed")}
                            onPhotoCapture={async (photoDataUrl) => {
                                updateFormData('photo', photoDataUrl);
                                try {
                                    const response = await fetch(photoDataUrl);
                                    const blob = await response.blob();
                                    const photoFile = new File([blob], 'captured_photo.jpg', { type: 'image/jpeg' });
                                    await uploadVisitorPhoto(photoFile);
                                } catch (error) {
                                    console.error('❌ Error uploading captured photo:', error);
                                }
                            }}
                            lang={lang}
                        />
                     </div>
                     {uploading && <p className="text-xs text-[#156152] mt-2">📤 Uploading...</p>}
                     {uploadError && <p className="text-xs text-red-600 mt-2">❌ {uploadError}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step1Identity;