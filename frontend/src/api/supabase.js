import { createClient } from '@supabase/supabase-js'

// Configuración del cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // No usar la autenticación de Supabase, seguimos usando ROBLE
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})

// Cliente Supabase configurado correctamente

// Función para crear/obtener usuario en Supabase basado en ROBLE
export const getOrCreateUser = async (robleUserId, email) => {
  try {
    // Primero intentar obtener el usuario por roble_user_id
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('roble_user_id', robleUserId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error getting user:', error)
      throw error
    }

    // Si no existe, crear el usuario
    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email,
            roble_user_id: robleUserId,
            preferences: {}
          }
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user:', insertError)
        throw insertError
      }

      user = newUser
    }

    return user
  } catch (error) {
    console.error('Error in getOrCreateUser:', error)
    throw error
  }
}

// Función para obtener el ID de usuario de Supabase
export const getSupabaseUserId = async (robleUserId, email) => {
  try {
    const user = await getOrCreateUser(robleUserId, email)
    return user.id
  } catch (error) {
    console.error('Error getting Supabase user ID:', error)
    return null
  }
}
