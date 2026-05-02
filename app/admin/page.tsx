import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import AdminControls from './AdminControls'

export const revalidate = 0

// Only this email can access the admin panel
const ADMIN_EMAIL = 'yayanew@proton.me'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')
  if (user.email !== ADMIN_EMAIL) notFound()

  // Fetch all users
  const { data: users } = await supabase
    .from('profiles')
    .select('id, name, username, institution, specialty, points, is_blocked')
    .order('points', { ascending: false })

  // Fetch recent reports
  const { data: reports } = await supabase
    .from('reports')
    .select('id, form_id, reason, note, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch all forms with is_active status
  const { data: forms } = await supabase
    .from('forms')
    .select('id, title, user_id, is_active, fill_count, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
        <p className="text-slate-500 text-sm mt-1">Only visible to you.</p>
      </div>

      {/* Reports */}
      <section>
        <h2 className="font-semibold text-slate-800 mb-4">
          Recent reports ({reports?.length ?? 0})
        </h2>
        {!reports || reports.length === 0 ? (
          <div className="bg-white border border-ivory-border rounded-xl p-6 text-slate-400 text-sm text-center">
            No reports yet.
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((r: any) => (
              <div key={r.id} className="bg-white border border-ivory-border rounded-xl px-5 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{r.reason}</p>
                  {r.note && <p className="text-xs text-slate-500 mt-0.5 truncate">"{r.note}"</p>}
                  <p className="text-xs text-slate-400 mt-0.5">
                    Survey: <a href={`/forms/${r.form_id}`} className="text-charcoal hover:underline">{r.form_id}</a>
                    {' · '}{new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Users */}
      <section>
        <h2 className="font-semibold text-slate-800 mb-4">
          All users ({users?.length ?? 0})
        </h2>
        <AdminControls users={users ?? []} forms={forms ?? []} />
      </section>
    </div>
  )
}
