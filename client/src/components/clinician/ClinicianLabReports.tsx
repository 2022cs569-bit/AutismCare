import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    FileText, Download, Clock, CheckCircle, AlertCircle,
    FlaskConical, Eye, Send, Baby, User, ChevronDown, ChevronUp,
    Filter, X, ShieldCheck, Plus, Search, Loader2
} from 'lucide-react';
import { labAPI } from '../../api';

interface Report {
    _id: string;
    fileUrl: string;
    fileType: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    releasedAt: string | null;
    labTechnicianId?: { firstName: string; lastName: string };
}

interface TestRequest {
    _id: string;
    childId: string;
    childName: string;
    childAge: number;
    testType: string;
    notes: string;
    status: string;
    releasedToParent: boolean;
    createdAt: string;
    updatedAt: string;
    reportCount: number;
    parentId?: { firstName: string; lastName: string; email: string; phoneNumber?: string };
    reports?: Report[];
}

interface ParentChild {
    _id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    age: number;
}

interface ParentResult {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    children: ParentChild[];
}

type StatusFilter = 'ALL' | 'PENDING' | 'UPLOADED' | 'RELEASED';

const TEST_TYPES = ['EEG', 'Genetic', 'Behavioral', 'Blood', 'Urine', 'Imaging', 'Other'];

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
    PENDING: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, label: 'Pending' },
    UPLOADED: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: FileText, label: 'Report Uploaded' },
    RELEASED: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: ShieldCheck, label: 'Reviewed & Released' },
};

export function ClinicianLabReports() {
    const [requests, setRequests] = useState<TestRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<StatusFilter>('ALL');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [detailData, setDetailData] = useState<Record<string, TestRequest>>({});
    const [loadingDetail, setLoadingDetail] = useState<string | null>(null);
    const [releasing, setReleasing] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [confirmReleaseId, setConfirmReleaseId] = useState<string | null>(null);

    // ── Request form state ──
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [parentSearch, setParentSearch] = useState('');
    const [parentResults, setParentResults] = useState<ParentResult[]>([]);
    const [searchingParents, setSearchingParents] = useState(false);
    const [selectedParent, setSelectedParent] = useState<ParentResult | null>(null);
    const [selectedChild, setSelectedChild] = useState<ParentChild | null>(null);
    const [selectedTestType, setSelectedTestType] = useState('');
    const [requestNotes, setRequestNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError('');
            const params: any = {};
            if (filter !== 'ALL') params.status = filter;
            const { data } = await labAPI.getClinicianRequests(params);
            setRequests(data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load lab requests');
        } finally {
            setLoading(false);
        }
    };

    // ── Parent search with debounce ──
    const handleParentSearch = (value: string) => {
        setParentSearch(value);
        setSelectedParent(null);
        setSelectedChild(null);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (value.trim().length < 2) {
            setParentResults([]);
            return;
        }
        searchTimeout.current = setTimeout(async () => {
            try {
                setSearchingParents(true);
                const { data } = await labAPI.searchParents(value.trim());
                setParentResults(data.data);
            } catch {
                setParentResults([]);
            } finally {
                setSearchingParents(false);
            }
        }, 400);
    };

    const selectParent = (parent: ParentResult) => {
        setSelectedParent(parent);
        setParentResults([]);
        setParentSearch(`${parent.firstName} ${parent.lastName}`);
        setSelectedChild(null);
    };

    const handleCreateRequest = async () => {
        if (!selectedParent || !selectedChild || !selectedTestType) return;
        try {
            setSubmitting(true);
            await labAPI.createTestRequest({
                parentId: selectedParent._id,
                childId: selectedChild._id,
                childName: `${selectedChild.firstName} ${selectedChild.lastName}`,
                childAge: selectedChild.age,
                testType: selectedTestType,
                notes: requestNotes
            });
            setSuccessMsg('Lab test request created successfully!');
            setTimeout(() => setSuccessMsg(''), 4000);
            resetRequestForm();
            fetchRequests();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create test request');
        } finally {
            setSubmitting(false);
        }
    };

    const resetRequestForm = () => {
        setShowRequestForm(false);
        setParentSearch('');
        setParentResults([]);
        setSelectedParent(null);
        setSelectedChild(null);
        setSelectedTestType('');
        setRequestNotes('');
    };

    const toggleExpand = async (id: string) => {
        if (expandedId === id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(id);

        // Fetch detail if not cached
        if (!detailData[id]) {
            try {
                setLoadingDetail(id);
                const { data } = await labAPI.getClinicianRequestById(id);
                setDetailData(prev => ({ ...prev, [id]: data.data }));
            } catch (err) {
                console.error('Failed to load request detail:', err);
            } finally {
                setLoadingDetail(null);
            }
        }
    };

    const handleRelease = async (requestId: string) => {
        try {
            setReleasing(requestId);
            await labAPI.releaseReport(requestId);
            setSuccessMsg('Report released to parent successfully!');
            setTimeout(() => setSuccessMsg(''), 4000);

            // Refresh data
            await fetchRequests();
            // Clear cached detail so it refreshes on next expand
            setDetailData(prev => {
                const copy = { ...prev };
                delete copy[requestId];
                return copy;
            });
            setExpandedId(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to release report');
        } finally {
            setReleasing(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const filterTabs: { value: StatusFilter; label: string; count: number }[] = [
        { value: 'ALL', label: 'All Requests', count: requests.length },
        { value: 'PENDING', label: 'Pending', count: requests.filter(r => r.status === 'PENDING').length },
        { value: 'UPLOADED', label: 'Ready for Review', count: requests.filter(r => r.status === 'UPLOADED').length },
        { value: 'RELEASED', label: 'Released', count: requests.filter(r => r.status === 'RELEASED').length },
    ];

    if (loading && requests.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                            <FlaskConical className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Lab Reports</h2>
                            <p className="text-gray-500 text-sm">Review and release lab test reports</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowRequestForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Request Lab Test
                    </button>
                </div>
            </div>

            {/* Success message */}
            {successMsg && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{successMsg}</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                <Filter className="w-4 h-4 text-gray-400" />
                {filterTabs.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filter === tab.value
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Empty state */}
            {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                    <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No lab requests found</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {filter !== 'ALL' ? 'Try a different filter' : 'Lab test requests you create will appear here'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => {
                        const cfg = statusConfig[request.status] || statusConfig.PENDING;
                        const StatusIcon = cfg.icon;
                        const isExpanded = expandedId === request._id;
                        const detail = detailData[request._id];
                        const isLoadingThis = loadingDetail === request._id;

                        return (
                            <div
                                key={request._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Summary row */}
                                <button
                                    onClick={() => toggleExpand(request._id)}
                                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                                >
                                    {/* Test type badge */}
                                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
                                        <FlaskConical className="w-5 h-5 text-gray-600" />
                                    </div>

                                    {/* Main info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-gray-900">{request.testType}</span>
                                            <span className="text-gray-300">·</span>
                                            <span className="text-sm text-gray-600">{request.childName}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span>Requested {formatDate(request.createdAt)}</span>
                                            {request.reportCount > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    {request.reportCount} report{request.reportCount > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {cfg.label}
                                    </span>

                                    {/* Expand icon */}
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    )}
                                </button>

                                {/* Expanded detail */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                                        {isLoadingThis ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                        ) : detail ? (
                                            <div className="space-y-5">
                                                {/* Info cards */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Child info */}
                                                    <div className="bg-white rounded-lg border border-gray-100 p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Baby className="w-4 h-4 text-teal-600" />
                                                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Child</span>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-900">{detail.childName}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{detail.childAge} years old</p>
                                                    </div>

                                                    {/* Parent info */}
                                                    <div className="bg-white rounded-lg border border-gray-100 p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <User className="w-4 h-4 text-purple-600" />
                                                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Parent / Guardian</span>
                                                        </div>
                                                        {detail.parentId ? (
                                                            <>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {detail.parentId.firstName} {detail.parentId.lastName}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{detail.parentId.email}</p>
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-gray-400">Not available</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Notes */}
                                                {detail.notes && (
                                                    <div className="bg-white rounded-lg border border-gray-100 p-4">
                                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Your Notes</p>
                                                        <p className="text-sm text-gray-700">{detail.notes}</p>
                                                    </div>
                                                )}

                                                {/* Reports */}
                                                {detail.reports && detail.reports.length > 0 ? (
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                                                            Uploaded Reports ({detail.reports.length})
                                                        </p>
                                                        <div className="space-y-2">
                                                            {detail.reports.map(report => (
                                                                <div key={report._id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-3">
                                                                    <div className="p-2 rounded-lg bg-blue-50">
                                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-gray-800 truncate">{report.fileName}</p>
                                                                        <p className="text-xs text-gray-400">
                                                                            {formatFileSize(report.fileSize)} · Uploaded {formatDate(report.uploadedAt)}
                                                                            {report.labTechnicianId && (
                                                                                <> · by {report.labTechnicianId.firstName} {report.labTechnicianId.lastName}</>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <a
                                                                        href={`${(import.meta as any).env?.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:4000'}${report.fileUrl}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                        View
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 bg-white rounded-lg border border-gray-100">
                                                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-400">No reports uploaded yet</p>
                                                    </div>
                                                )}

                                                {/* Release button — only for UPLOADED status */}
                                                {detail.status === 'UPLOADED' && (
                                                    <button
                                                        onClick={() => setConfirmReleaseId(detail._id)}
                                                        disabled={releasing === detail._id}
                                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        {releasing === detail._id ? 'Releasing...' : 'Review & Release to Parent'}
                                                    </button>
                                                )}

                                                {detail.status === 'RELEASED' && (
                                                    <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                        <span className="text-sm text-emerald-700 font-medium">
                                                            This report has been reviewed and released to the parent
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 text-center py-4">Failed to load details</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Confirmation Modal (portaled to body) ── */}
            {confirmReleaseId && createPortal(
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    {/* Backdrop */}
                    <div
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
                        onClick={() => setConfirmReleaseId(null)}
                    />
                    {/* Modal */}
                    <div style={{ position: 'relative', zIndex: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        {/* Close */}
                        <button
                            onClick={() => setConfirmReleaseId(null)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
                                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                            </div>
                        </div>

                        {/* Title & description */}
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                            Release Report to Parent?
                        </h3>
                        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                            This will mark the report as <strong>Reviewed &amp; Released</strong> and
                            notify the parent via email that the results are available.
                            This action cannot be undone.
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmReleaseId(null)}
                                className="flex-1 py-2.5 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleRelease(confirmReleaseId);
                                    setConfirmReleaseId(null);
                                }}
                                disabled={releasing === confirmReleaseId}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all shadow-sm"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Yes, Release
                            </button>
                        </div>
                    </div>
                </div>
                , document.body)}

            {/* ── Request Lab Test Modal ── */}
            {showRequestForm && createPortal(
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    {/* Backdrop */}
                    <div
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
                        onClick={resetRequestForm}
                    />
                    {/* Modal */}
                    <div style={{ position: 'relative', zIndex: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        {/* Close */}
                        <button
                            onClick={resetRequestForm}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Title */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                <FlaskConical className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Request Lab Test</h3>
                                <p className="text-sm text-gray-500">Create a new lab test request for a child</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Parent search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Search Parent</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={parentSearch}
                                        onChange={(e) => handleParentSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {searchingParents && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                                    )}
                                </div>
                                {/* Dropdown results */}
                                {parentResults.length > 0 && !selectedParent && (
                                    <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {parentResults.map(p => (
                                            <button
                                                key={p._id}
                                                onClick={() => selectParent(p)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                                                <p className="text-xs text-gray-500">{p.email} · {p.children.length} child{p.children.length !== 1 ? 'ren' : ''}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected parent info */}
                            {selectedParent && (
                                <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-900">{selectedParent.firstName} {selectedParent.lastName}</span>
                                            <span className="text-xs text-blue-600">({selectedParent.email})</span>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedParent(null); setParentSearch(''); setSelectedChild(null); }}
                                            className="text-blue-400 hover:text-blue-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Child selection */}
                            {selectedParent && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Child</label>
                                    {selectedParent.children.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic">This parent has no registered children</p>
                                    ) : (
                                        <div className="grid gap-2">
                                            {selectedParent.children.map(child => (
                                                <button
                                                    key={child._id}
                                                    onClick={() => setSelectedChild(child)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${selectedChild?._id === child._id
                                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <Baby className={`w-4 h-4 flex-shrink-0 ${selectedChild?._id === child._id ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{child.firstName} {child.lastName}</p>
                                                        <p className="text-xs text-gray-500">{child.age} years old · {child.gender}</p>
                                                    </div>
                                                    {selectedChild?._id === child._id && (
                                                        <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Test type */}
                            {selectedChild && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {TEST_TYPES.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedTestType(type)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${selectedTestType === type
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedTestType && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                                    <textarea
                                        placeholder="Add any relevant clinical notes..."
                                        value={requestNotes}
                                        onChange={(e) => setRequestNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            )}

                            {/* Submit */}
                            {selectedTestType && (
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={resetRequestForm}
                                        className="flex-1 py-2.5 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateRequest}
                                        disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-sm"
                                    >
                                        {submitting ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Create Request</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                , document.body)}
        </div>
    );
}
