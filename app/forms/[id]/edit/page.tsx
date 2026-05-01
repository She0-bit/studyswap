import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import EditFormClient from './EditFormClient'

export const revalidate = 0

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: form } = await supabase.from('forms').select('*').eq('id', id).single()
  if (!form) notFound()
  if (form.user_id !== user.id) notFound() // only owner can edit

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Edit survey</h1>
        <p className="text-slate-500 text-sm mt-1">Update your survey details below.</p>
      </div>
      <EditFormClient form={form} />
    </div>
  )
}
