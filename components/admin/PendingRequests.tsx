import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  Input,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import { adminService, visitorService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { Edit20Regular } from '@fluentui/react-icons';

const FILE_BASE_URL = 'http://localhost:3001';
// For production, update this to your API URL
// or use environment variables in vite.config.ts

const constructMediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;

  // Already a full URL → return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Normalize path (ensure it starts with /)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${FILE_BASE_URL}${normalizedPath}`;
};

interface VisitorRequest {
  request_id: number;
  visitor_name: string;
  visitor_type?: string;
  mobile_number: string;
  pass_id: string;
  host_name?: string;
  department?: string;
  visit_date: string;
  visit_start_time: string;
  visit_end_time: string;
  number_of_visitors: number;
  status: string;
  created_at?: string;
  visitor_photo_url?: string;
  document_url?: string;
}

interface EditFormData {
  visitor_name: string;
  purpose: string;
  visit_start_time: string;
  visit_end_time: string;
}

interface PendingRequestsProps {
  lang: 'en' | 'hi';
}

const content = {
  en: {
    title: 'Pending Requests',
    noRequests: 'No pending requests',
    loading: 'Loading requests...',
    visitorDetails: 'Visitor Details',
    hostDepartment: 'Host & Department',
    purpose: 'Purpose/Reason',
    timing: 'Timing',
    name: 'Name',
    phone: 'Phone',
    date: 'Visit Date',
    time: 'Time Slot',
    visitors: 'Number of Visitors',
    host: 'Host Name',
    department: 'Department',
    type: 'Visitor Type',
    passId: 'Pass ID',
    approve: 'Approve',
    reject: 'Reject',
    edit: 'Edit',
    approveTitle: 'Approve Request',
    approveMessage: 'Are you sure you want to approve this visitor request?',
    rejectTitle: 'Reject Request',
    rejectMessage: 'Are you sure you want to reject this visitor request?',
    editTitle: 'Edit Visitor Request',
    success: 'Request updated successfully',
    error: 'Failed to update request',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save Changes',
    startTime: 'Start Time',
    endTime: 'End Time',
  },
  hi: {
    title: 'लंबित अनुरोध',
    noRequests: 'कोई लंबित अनुरोध नहीं',
    loading: 'अनुरोध लोड हो रहे हैं...',
    visitorDetails: 'आगंतुक विवरण',
    hostDepartment: 'मेजबान और विभाग',
    purpose: 'उद्देश्य/कारण',
    timing: 'समय',
    name: 'नाम',
    phone: 'फोन',
    date: 'यात्रा की तारीख',
    time: 'समय स्लॉट',
    visitors: 'आगंतुकों की संख्या',
    host: 'मेजबान का नाम',
    department: 'विभाग',
    type: 'आगंतुक प्रकार',
    passId: 'पास आईडी',
    approve: 'मंजूर करें',
    reject: 'अस्वीकार करें',
    edit: 'संपादित करें',
    approveTitle: 'अनुरोध को मंजूर करें',
    approveMessage: 'क्या आप इस आगंतुक अनुरोध को मंजूर करना चाहते हैं?',
    rejectTitle: 'अनुरोध को अस्वीकार करें',
    rejectMessage: 'क्या आप इस आगंतुक अनुरोध को अस्वीकार करना चाहते हैं?',
    editTitle: 'आगंतुक अनुरोध संपादित करें',
    success: 'अनुरोध सफलतापूर्वक अपडेट किया गया',
    error: 'अनुरोध अपडेट करने में विफल',
    confirm: 'पुष्टि करें',
    cancel: 'रद्द करें',
    save: 'परिवर्तन सहेजें',
    startTime: 'शुरुआत का समय',
    endTime: 'समाप्ति का समय',
  },
};

const PendingRequests: React.FC<PendingRequestsProps> = ({ lang }) => {
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    visitor_name: '',
    purpose: '',
    visit_start_time: '',
    visit_end_time: '',
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isIdProofOpen, setIsIdProofOpen] = useState(false);
  const [selectedRequestForIdProof, setSelectedRequestForIdProof] = useState<VisitorRequest | null>(null);
  const [photoErrors, setPhotoErrors] = useState<Record<number, boolean>>({});
  const [documentErrors, setDocumentErrors] = useState<Record<number, boolean>>({});

  const { addNotification } = useNotification();
  const t = content[lang];

  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingAppointments();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      const request = requests.find((r) => r.request_id === requestId);
      await visitorService.updateRequestStatus(requestId, 'APPROVED');
      addNotification({
        title: `Request Approved: In-Person meet with ${request?.host_name || 'Officer'}`,
        time: 'Just now',
        date: 'Today',
        isUnread: true,
        type: 'success',
        data: {
          visitorName: request?.visitor_name,
          passId: request?.pass_id,
          hostName: request?.host_name,
        },
      });
      setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
    } catch (error) {
      alert(t.error);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      const request = requests.find((r) => r.request_id === requestId);
      await visitorService.updateRequestStatus(requestId, 'REJECTED');
      addNotification({
        title: `Request Rejected: ${request?.visitor_name} - ${request?.visitor_type || 'Visitor'}`,
        time: 'Just now',
        date: 'Today',
        isUnread: true,
        type: 'alert',
        data: {
          visitorName: request?.visitor_name,
          passId: request?.pass_id,
          reason: 'Request was rejected by admin',
        },
      });
      setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
    } catch (error) {
      alert(t.error);
    }
  };

  const handleEditClick = (request: VisitorRequest) => {
    setEditingRequestId(request.request_id);
    setEditFormData({
      visitor_name: request.visitor_name,
      purpose: request.visitor_type || 'Not Specified',
      visit_start_time: request.visit_start_time,
      visit_end_time: request.visit_end_time,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async (requestId: number) => {
    try {
      const updates: Partial<VisitorRequest> = {};

      if (editFormData.visitor_name?.trim()) updates.visitor_name = editFormData.visitor_name.trim();
      if (editFormData.purpose?.trim()) updates.visitor_type = editFormData.purpose.trim();
      if (editFormData.visit_start_time?.trim()) updates.visit_start_time = editFormData.visit_start_time.trim();
      if (editFormData.visit_end_time?.trim()) updates.visit_end_time = editFormData.visit_end_time.trim();

      if (Object.keys(updates).length === 0) {
        alert('No changes to save');
        return;
      }

      await visitorService.updateVisitorRequest(requestId, updates);

      setRequests((prev) =>
        prev.map((r) => (r.request_id === requestId ? { ...r, ...updates } : r))
      );

      setIsEditDialogOpen(false);
      setEditingRequestId(null);
      addNotification({
        title: 'Request Updated',
        time: 'Just now',
        date: 'Today',
        isUnread: true,
        type: 'success',
        data: { visitorName: requests.find(r => r.request_id === requestId)?.visitor_name }
      });
    } catch (error) {
      console.error('Update failed:', error);
      alert(t.error);
    }
  };

  if (loading) return <div className="text-center py-8">{t.loading}</div>;
  if (requests.length === 0) return <div className="text-center py-8">{t.noRequests}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.title}</h2>

      {requests.map((request) => {
        const photoUrl = constructMediaUrl(request.visitor_photo_url);
        const docUrl = constructMediaUrl(request.document_url);

        return (
          <div
            key={request.request_id}
            className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col items-center gap-3 min-w-[100px]">
                {photoUrl && !photoErrors[request.request_id] ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={photoUrl}
                      alt={`${request.visitor_name} photo`}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={() => setPhotoErrors((prev) => ({ ...prev, [request.request_id]: true }))}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-indigo-400">
                    {request.visitor_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}

                {docUrl && (
                  <Button
                    size="small"
                    appearance="outline"
                    onClick={() => {
                      setSelectedRequestForIdProof(request);
                      setIsIdProofOpen(true);
                    }}
                  >
                    View ID Proof
                  </Button>
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.name}</p>
                  <p className="font-medium">{request.visitor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.phone}</p>
                  <p className="font-medium">{request.mobile_number}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.type}</p>
                  <p className="font-medium">{request.visitor_type || 'Visitor'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.passId}</p>
                  <p className="font-mono">{request.pass_id}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.host}</p>
                <p className="font-medium">{request.host_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.department}</p>
                <p className="font-medium">{request.department || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.date}</p>
                <p className="font-medium">{request.visit_date.split('T')[0]}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.time}</p>
                <p className="font-medium">
                  {request.visit_start_time} – {request.visit_end_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.visitors}</p>
                <p className="font-medium">{request.number_of_visitors}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              {/* Edit Dialog */}
              <Dialog
                open={isEditDialogOpen && editingRequestId === request.request_id}
                onOpenChange={(_, data) => {
                  if (!data.open) {
                    setIsEditDialogOpen(false);
                    setEditingRequestId(null);
                  }
                }}
              >
                <DialogTrigger disableButtonEnhancement>
                  <Button
                    appearance="secondary"
                    icon={<Edit20Regular />}
                    onClick={() => handleEditClick(request)}
                  >
                    {t.edit}
                  </Button>
                </DialogTrigger>
                <DialogSurface>
                  <DialogTitle>{t.editTitle}</DialogTitle>
                  <DialogBody>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          {t.name}
                        </label>
                        <Input
                          value={editFormData.visitor_name}
                          onChange={(e) => setEditFormData({ ...editFormData, visitor_name: e.target.value })}
                          placeholder="Enter visitor name"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          {t.purpose}
                        </label>
                        <Dropdown
                          value={editFormData.purpose}
                          onOptionSelect={(_, data) =>
                            setEditFormData({ ...editFormData, purpose: (data.optionValue as string) || '' })
                          }
                          placeholder="Select visitor type"
                          className="w-full"
                        >
                          <Option value="Visitor">Visitor</Option>
                          <Option value="Vendor">Vendor</Option>
                          <Option value="Officer">Officer</Option>
                        </Dropdown>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            {t.startTime}
                          </label>
                          <Input
                            type="time"
                            value={editFormData.visit_start_time}
                            onChange={(e) => setEditFormData({ ...editFormData, visit_start_time: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            {t.endTime}
                          </label>
                          <Input
                            type="time"
                            value={editFormData.visit_end_time}
                            onChange={(e) => setEditFormData({ ...editFormData, visit_end_time: e.target.value })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </DialogBody>
                  <DialogActions>
                    <DialogTrigger disableButtonEnhancement>
                      <Button appearance="secondary">{t.cancel}</Button>
                    </DialogTrigger>
                    <Button appearance="primary" onClick={() => handleEditSave(request.request_id)}>
                      {t.save}
                    </Button>
                  </DialogActions>
                </DialogSurface>
              </Dialog>

              {/* Reject Dialog */}
              <Dialog>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="secondary">{t.reject}</Button>
                </DialogTrigger>
                <DialogSurface className="max-w-2xl">
                  <DialogTitle>{t.rejectTitle}</DialogTitle>
                  <DialogBody>
                    <div className="space-y-6">
                      <div className="flex gap-6">
                        <div className="flex flex-col items-center gap-2">
                          {photoUrl && !photoErrors[request.request_id] ? (
                            <img
                              src={photoUrl}
                              alt={request.visitor_name}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              onError={() => setPhotoErrors((prev) => ({ ...prev, [request.request_id]: true }))}
                              className="w-20 h-20 rounded-full object-cover border-2 border-neutral-300"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                              {request.visitor_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="text-sm text-neutral-500">{t.name}</p>
                            <p className="font-medium">{request.visitor_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">{t.phone}</p>
                            <p className="font-medium">{request.mobile_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">{t.type}</p>
                            <p className="font-medium">{request.visitor_type || 'Visitor'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-neutral-500">{t.host}</p>
                          <p className="font-medium">{request.host_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">{t.department}</p>
                          <p className="font-medium">{request.department || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-neutral-500">{t.date}</p>
                          <p className="font-medium">{request.visit_date.split('T')[0]}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">{t.time}</p>
                          <p className="font-medium">
                            {request.visit_start_time} – {request.visit_end_time}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">{t.visitors}</p>
                          <p className="font-medium">{request.number_of_visitors}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{t.rejectMessage}</p>
                      </div>
                    </div>
                  </DialogBody>
                  <DialogActions>
                    <DialogTrigger disableButtonEnhancement>
                      <Button appearance="secondary">{t.cancel}</Button>
                    </DialogTrigger>
                    <Button appearance="primary" onClick={() => handleReject(request.request_id)}>
                      {t.confirm}
                    </Button>
                  </DialogActions>
                </DialogSurface>
              </Dialog>

              {/* Approve Dialog */}
              <Dialog>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="primary">{t.approve}</Button>
                </DialogTrigger>
                <DialogSurface className="max-w-2xl">
                  <DialogTitle>{t.approveTitle}</DialogTitle>
                  <DialogBody>
                    <div className="space-y-6">
                      <div className="flex gap-6">
                        <div className="flex flex-col items-center gap-2">
                          {photoUrl && !photoErrors[request.request_id] ? (
                            <img
                              src={photoUrl}
                              alt={request.visitor_name}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              onError={() => setPhotoErrors((prev) => ({ ...prev, [request.request_id]: true }))}
                              className="w-20 h-20 rounded-full object-cover border-2 border-neutral-300"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                              {request.visitor_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="text-sm text-neutral-500">{t.name}</p>
                            <p className="font-medium">{request.visitor_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">{t.phone}</p>
                            <p className="font-medium">{request.mobile_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500">{t.type}</p>
                            <p className="font-medium">{request.visitor_type || 'Visitor'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-neutral-500">{t.host}</p>
                          <p className="font-medium">{request.host_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">{t.department}</p>
                          <p className="font-medium">{request.department || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-neutral-500">{t.date}</p>
                          <p className="font-medium">{request.visit_date.split('T')[0]}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">{t.time}</p>
                          <p className="font-medium">
                            {request.visit_start_time} – {request.visit_end_time}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">{t.visitors}</p>
                          <p className="font-medium">{request.number_of_visitors}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200">{t.approveMessage}</p>
                      </div>
                    </div>
                  </DialogBody>
                  <DialogActions>
                    <DialogTrigger disableButtonEnhancement>
                      <Button appearance="secondary">{t.cancel}</Button>
                    </DialogTrigger>
                    <Button appearance="primary" onClick={() => handleApprove(request.request_id)}>
                      {t.confirm}
                    </Button>
                  </DialogActions>
                </DialogSurface>
              </Dialog>
            </div>
          </div>
        );
      })}

      {/* ID Proof Viewer Dialog */}
      <Dialog open={isIdProofOpen} onOpenChange={(_, data) => !data.open && setIsIdProofOpen(false)}>
        <DialogSurface className="max-w-4xl">
          <DialogTitle>Identity Proof Document</DialogTitle>
          <DialogBody>
            {selectedRequestForIdProof?.document_url ? (
              documentErrors[selectedRequestForIdProof.request_id] ? (
                <div className="p-10 text-center text-red-600 dark:text-red-400">
                  Failed to load document
                  <p className="text-sm mt-3 break-all opacity-70 font-mono">
                    {constructMediaUrl(selectedRequestForIdProof.document_url)}
                  </p>
                </div>
              ) : (
                <div className="flex justify-center bg-neutral-50 dark:bg-neutral-950 p-6 rounded-lg">
                  {selectedRequestForIdProof.document_url.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={constructMediaUrl(selectedRequestForIdProof.document_url) || ''}
                      title="Identity Proof Document"
                      className="w-full h-[70vh] rounded border border-neutral-300 shadow-xl"
                      onError={() =>
                        setDocumentErrors((prev) => ({
                          ...prev,
                          [selectedRequestForIdProof.request_id]: true,
                        }))
                      }
                    />
                  ) : (
                    <img
                      src={constructMediaUrl(selectedRequestForIdProof.document_url) || ''}
                      alt="Identity Proof Document"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={() =>
                        setDocumentErrors((prev) => ({
                          ...prev,
                          [selectedRequestForIdProof.request_id]: true,
                        }))
                      }
                      className="max-w-full max-h-[70vh] object-contain rounded shadow-xl"
                    />
                  )}
                </div>
              )
            ) : (
              <p className="text-center text-neutral-500 py-16">No document available</p>
            )}
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setIsIdProofOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default PendingRequests;