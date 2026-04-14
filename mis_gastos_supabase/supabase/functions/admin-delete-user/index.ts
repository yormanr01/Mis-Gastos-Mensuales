import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Obtener al usuario que hace la petición
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('No autorizado')

    // 2. Verificar si es Administrador en la tabla profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (profileError || profile.role !== 'Administrador' || profile.status !== 'Activo') {
      throw new Error('No tienes permisos de administrador activos')
    }

    // 3. Procesar la petición
    const { userId } = await req.json()
    if (!userId) throw new Error('Se requiere el userId a eliminar')
    
    // Evitar que un admin se borre a sí mismo por accidente
    if (userId === user.id) throw new Error('No puedes eliminar tu propia cuenta desde aquí')

    // 4. Client con Service Role para bypass de RLS y Admin Auth API
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Borramos el usuario en Auth (esto debería borrar el perfil en cascada si está configurado en Postgres)
    // De lo contrario, lo borramos manualmente también.
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) throw deleteError

    return new Response(
      JSON.stringify({ message: 'Usuario eliminado correctamente' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
