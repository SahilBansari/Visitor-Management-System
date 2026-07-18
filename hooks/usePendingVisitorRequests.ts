import { useEffect, useState, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { visitorService } from '../services/api';

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
}

export const usePendingVisitorRequests = (autoNotify: boolean = true) => {
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();
  const previousRequestsRef = useRef<number[]>([]); // Track request IDs we've already notified

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await visitorService.getRequests('PENDING');
      
      if (response.data && Array.isArray(response.data)) {
        const newRequests = response.data as VisitorRequest[];
        
        // Auto-notify on new requests
        if (autoNotify) {
          newRequests.forEach(request => {
            const requestId = request.request_id;
            if (!previousRequestsRef.current.includes(requestId)) {
              addNotification({
                title: `New Visit Request: ${request.visitor_name} (${request.visitor_type || 'Visitor'})`,
                time: 'Just now',
                date: 'Today',
                isUnread: true,
                type: 'info',
                data: {
                  visitorName: request.visitor_name,
                  passId: request.pass_id,
                  department: request.department,
                  officer: request.host_name,
                  requestId: requestId
                }
              });
              previousRequestsRef.current.push(requestId);
            }
          });
        }
        
        setRequests(newRequests);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch requests';
      setError(message);
      console.error('Error fetching pending requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchRequests();
    
    // Set up polling every 30 seconds for new requests
    const interval = setInterval(fetchRequests, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests
  };
};
