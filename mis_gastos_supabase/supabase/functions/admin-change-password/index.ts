import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Esta función usa SERVICE_ROLE_KEY para crear un cliente admin y
// actualizar contraseñas de usuario. No debe requerir un JWT legacy
// en el cliente. En el dashboard de Supabase, desactiva
// "Verify JWT with legacy secret" para esta función.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Manejar preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, newPassword } = await req.json()
    console.log(`[admin-change-password] Recibido: userId=${userId}`)
    
    if (!userId || !newPassword) {
      throw new Error('userId y newPassword son requeridos')
    }

    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      console.error('[admin-change-password] SERVICE_ROLE_KEY no configurado')
      throw new Error('SERVICE_ROLE_KEY no configurado en las variables de entorno')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    if (!supabaseUrl) {
      console.error('[admin-change-password] SUPABASE_URL no configurado')
      throw new Error('SUPABASE_URL no configurado')
    }

    console.log(`[admin-change-password] Conectando a: ${supabaseUrl}`)
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    console.log(`[admin-change-password] Intentando actualizar contraseña para userId: ${userId}`)
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (updateError) {
      console.error(`[admin-change-password] Error de actualización:`, updateError)
      throw updateError
    }

    console.log(`[admin-change-password] Contraseña actualizada correctamente para: ${userId}`)
    return new Response(
      JSON.stringify({ message: 'Contraseña actualizada correctamente' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[admin-change-password] Error capturado:`, errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
