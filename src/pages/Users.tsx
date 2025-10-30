import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getParticipants } from '@/lib/api';
import { Users as UsersIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Participant {
  id: number;
  walletid: string;
  paid: number | boolean;
  col1?: string | null;
  col2?: string | null; // joining time
  col3?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function Users() {
  const { token } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const loadParticipants = async (p = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getParticipants(token, p, 50);
      setParticipants(res.participants || []);
      setPages(res.pagination?.pages || 1);
      setPage(res.pagination?.page || p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const formatDateTime = (dt?: string | null) => {
    if (!dt) return '-';
    // Accept ISO or SQLite timestamp
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt;
    return d.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UsersIcon className="w-7 h-7 text-primary" />
            View Participants
          </h1>
          <Button onClick={() => loadParticipants(page)} variant="outline" className="text-white border-primary/30 hover:bg-primary/10">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card className="bg-slate-900/60 border border-primary/20">
          <CardHeader>
            <CardTitle className="text-white">Participants</CardTitle>
            <CardDescription className="text-slate-300">Connected wallets and their join time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-300 border-b border-slate-700/60">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Wallet Address</th>
                    <th className="py-3 px-4">Join Time</th>
                    <th className="py-3 px-4">Tokens Purchased</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 px-4 text-center text-slate-400">{loading ? 'Loading...' : 'No participants yet'}</td>
                    </tr>
                  )}
                  {participants.map((p, idx) => (
                    <tr key={p.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-slate-300">{(page - 1) * 50 + idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-white break-all">{p.walletid}</td>
                      <td className="py-3 px-4 text-slate-200">{formatDateTime(p.col2 || p.created_at)}</td>
                      <td className="py-3 px-4 text-slate-200">
                        {(() => {
                          const total = parseFloat(p.col3 || '0');
                          if (!isFinite(total) || total <= 0) return '0 MEME';
                          return `${total.toLocaleString()} MEME`;
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-slate-300">Page {page} of {pages}</div>
              <div className="flex gap-2">
                <Button disabled={loading || page <= 1} variant="outline" className="text-white border-primary/30" onClick={() => loadParticipants(page - 1)}>
                  Prev
                </Button>
                <Button disabled={loading || page >= pages} variant="outline" className="text-white border-primary/30" onClick={() => loadParticipants(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


