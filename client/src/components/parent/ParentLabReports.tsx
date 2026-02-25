import { useState, useEffect } from 'react';
import {
    FileText, Download, Clock, AlertCircle, FlaskConical, Eye,
    Baby, User, ChevronDown, ChevronUp, ShieldCheck, Calendar
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
    clinicianId?: { firstName: string; lastName: string; email: string };
    reports?: Report[];
}

export function ParentLabReports() {
    const [requests, setRequests] = useState<TestRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await labAPI.getParentReports();
            setRequests(data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load lab reports');
        } finally {
            setLoading(false);
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

    const getFileUrl = (fileUrl: string) => {
        const base = (import.meta as any).env?.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:4000';
        return `${base}${fileUrl}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                        <FlaskConical className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Lab Reports</h2>
                        <p className="text-gray-500 text-sm">Reviewed and released lab test reports for your children</p>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Empty state */}
            {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                    <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No lab reports available yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                        When your clinician reviews and releases lab test reports, they will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Summary banner */}
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">
                            {requests.length} report{requests.length !== 1 ? 's' : ''} reviewed and released by your clinician
                        </span>
                    </div>

                    {requests.map((request) => {
                        const isExpanded = expandedId === request._id;

                        return (
                            <div
                                key={request._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Summary row */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : request._id)}
                                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                                >
                                    {/* Test type icon */}
                                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 flex-shrink-0">
                                        <FlaskConical className="w-5 h-5 text-teal-600" />
                                    </div>

                                    {/* Main info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-gray-900">{request.testType}</span>
                                            <span className="text-gray-300">·</span>
                                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                                <Baby className="w-3.5 h-3.5" />
                                                {request.childName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Released {formatDate(request.updatedAt)}
                                            </span>
                                            {request.reports && request.reports.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    {request.reports.length} file{request.reports.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Reviewed & Released
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
                                        <div className="space-y-5">
                                            {/* Info cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Child info */}
                                                <div className="bg-white rounded-lg border border-gray-100 p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Baby className="w-4 h-4 text-teal-600" />
                                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Child</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900">{request.childName}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{request.childAge} years old</p>
                                                </div>

                                                {/* Clinician info */}
                                                <div className="bg-white rounded-lg border border-gray-100 p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <User className="w-4 h-4 text-blue-600" />
                                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Reviewed By</span>
                                                    </div>
                                                    {request.clinicianId ? (
                                                        <>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                Dr. {request.clinicianId.firstName} {request.clinicianId.lastName}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{request.clinicianId.email}</p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-gray-400">Not available</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {request.notes && (
                                                <div className="bg-white rounded-lg border border-gray-100 p-4">
                                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Clinician's Notes</p>
                                                    <p className="text-sm text-gray-700">{request.notes}</p>
                                                </div>
                                            )}

                                            {/* Report files */}
                                            {request.reports && request.reports.length > 0 ? (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                                                        Report Files ({request.reports.length})
                                                    </p>
                                                    <div className="space-y-2">
                                                        {request.reports.map(report => (
                                                            <div key={report._id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-3">
                                                                <div className="p-2 rounded-lg bg-teal-50">
                                                                    <FileText className="w-4 h-4 text-teal-600" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 truncate">{report.fileName}</p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {formatFileSize(report.fileSize)} · Uploaded {formatDate(report.uploadedAt)}
                                                                        {report.releasedAt && (
                                                                            <> · Released {formatDate(report.releasedAt)}</>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <a
                                                                        href={getFileUrl(report.fileUrl)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                        View
                                                                    </a>
                                                                    <a
                                                                        href={getFileUrl(report.fileUrl)}
                                                                        download={report.fileName}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                                                    >
                                                                        <Download className="w-3.5 h-3.5" />
                                                                        Download
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 bg-white rounded-lg border border-gray-100">
                                                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-400">No report files available</p>
                                                </div>
                                            )}

                                            {/* Released confirmation banner */}
                                            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                <span className="text-sm text-emerald-700 font-medium">
                                                    This report has been reviewed and released by your clinician
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
