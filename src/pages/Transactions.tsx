import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getTxLog } from '@/lib/api';
import { BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TxLog {
  id: number;
  walletid: string;
  chain?: string | null;
  amount?: number | null;
  created_at: string;
}

export default function Transactions() {
  const { token } = useAuth();
  const [txs, setTxs] = useState<TxLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async (p = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getTxLog(token, p, 50);
      setTxs(res.transactions || []);
      setPages(res.pagination?.pages || 1);
      setPage(res.pagination?.page || p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const formatDate = (s: string) => {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            Transaction History
          </h1>
          <Button onClick={() => load(page)} variant="outline" className="text-white border-primary/30 hover:bg-primary/10">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card className="bg-slate-900/60 border border-primary/20">
          <CardHeader>
            <CardTitle className="text-white">Transactions</CardTitle>
            <CardDescription className="text-slate-300">Wallet, chain, amount, and time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-300 border-b border-slate-700/60">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Wallet</th>
                    <th className="py-3 px-4">Chain</th>
                    <th className="py-3 px-4">Amount (Native/USDT)</th>
                    <th className="py-3 px-4">Date-Time</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-slate-400">{loading ? 'Loading...' : 'No transactions yet'}</td>
                    </tr>
                  )}
                  {txs.map((t, idx) => (
                    <tr key={t.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-slate-300">{(page - 1) * 50 + idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-white break-all">{t.walletid}</td>
                      <td className="py-3 px-4 text-slate-200">{t.chain || '-'}</td>
                      <td className="py-3 px-4 text-slate-200">{typeof t.amount === 'number' ? t.amount.toLocaleString() : '-'}</td>
                      <td className="py-3 px-4 text-slate-200">{formatDate(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-slate-300">Page {page} of {pages}</div>
              <div className="flex gap-2">
                <Button disabled={loading || page <= 1} variant="outline" className="text-white border-primary/30" onClick={() => load(page - 1)}>
                  Prev
                </Button>
                <Button disabled={loading || page >= pages} variant="outline" className="text-white border-primary/30" onClick={() => load(page + 1)}>
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
