import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Esta función usa SERVICE_ROLE_KEY para crear un cliente admin y
// ejecutar acciones seguras en auth.admin. No debe requerir un JWT legacy
// en el cliente. En el dashboard de Supabase, desactiva
// "Verify JWT with legacy secret" para esta función.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    if (!userId) throw new Error('Se requiere el userId a eliminar')

    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')
    if (!serviceRoleKey) throw new Error('SERVICE_ROLE_KEY no configurado')

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

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
