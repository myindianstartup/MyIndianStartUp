import React, { useEffect, useState } from 'react';
import { Flag, Loader2, MessageSquareReply } from 'lucide-react';

const statusOptions = ['open', 'reviewing', 'resolved', 'dismissed'];

const statusTone = {
  open: 'bg-rose-50 text-rose-700 border-rose-100',
  reviewing: 'bg-blue-50 text-blue-700 border-blue-100',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  dismissed: 'bg-slate-100 text-slate-600 border-slate-200'
};

const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const ReportCard = ({ report, onUpdate, updating }) => {
  const [status, setStatus] = useState(report.status || 'open');
  const [adminResponse, setAdminResponse] = useState(report.adminResponse || '');

  useEffect(() => {
    setStatus(report.status || 'open');
    setAdminResponse(report.adminResponse || '');
  }, [report.id, report.status, report.adminResponse]);

  const postLabel = report.post?.mediaType === 'video' ? 'Video report' : 'Post report';
  const authorName = report.post?.author?.name || 'Unknown author';
  const reporterName = report.reporter?.name || report.reporter?.email || 'Unknown reporter';
  const caption = report.post?.caption || 'Post content is not available.';

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">
            <Flag className="h-3.5 w-3.5" />
            {postLabel}
          </div>
          <h3 className="mt-3 text-lg font-black text-slate-950">{report.reason}</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Reported by {reporterName} on {formatDate(report.createdAt)}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${statusTone[report.status] || statusTone.open}`}>
          {report.status || 'open'}
        </span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Reported issue</div>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{report.details || 'No extra details added by the user.'}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Post under review</div>
          <p className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-slate-700">{caption}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">By {authorName}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[220px_1fr_auto]">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black capitalize text-slate-800 outline-none focus:border-blue-300"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <textarea
          value={adminResponse}
          onChange={(event) => setAdminResponse(event.target.value)}
          rows={2}
          placeholder="Write admin response or action note..."
          className="resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-300"
        />
        <button
          type="button"
          onClick={() => onUpdate(report.id, { status, adminResponse })}
          disabled={updating}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareReply className="h-4 w-4" />}
          Save
        </button>
      </div>
    </article>
  );
};

const PostReportsPanel = ({ reports = [], onUpdate, updatingId = '', title = 'Post and video reports' }) => (
  <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Moderation queue</div>
        <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-900">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          Review reports submitted from the FeedVerse post menu, update status, and keep a response note for the user issue.
        </p>
      </div>
      <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {reports.length} reports
      </span>
    </div>

    <div className="mt-5 grid gap-4">
      {reports.length ? reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onUpdate={onUpdate}
          updating={updatingId === report.id}
        />
      )) : (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <div className="text-sm font-black text-slate-700">No post reports yet.</div>
          <p className="mt-2 text-sm font-semibold text-slate-500">When a member reports a post or video, it will appear here for review.</p>
        </div>
      )}
    </div>
  </section>
);

export default PostReportsPanel;
