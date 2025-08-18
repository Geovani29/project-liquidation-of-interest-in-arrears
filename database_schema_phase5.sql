-- FASE 5: Funcionalidades Avanzadas - Esquema de Base de Datos

-- 1. Tabla de etiquetas (tags)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) DEFAULT '#3B82F6',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 2. Tabla de carpetas/categorías
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, parent_id)
);

-- 3. Tabla de plantillas
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  form_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de relación cálculos-etiquetas (muchos a muchos)
CREATE TABLE IF NOT EXISTS public.calculation_tags (
  calculation_id UUID NOT NULL REFERENCES public.calculations(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (calculation_id, tag_id)
);

-- 5. Agregar columnas a la tabla de cálculos existente
ALTER TABLE public.calculations 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS capital_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS total_interest DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS days_calculated INTEGER,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 6. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_calculations_folder_id ON public.calculations(folder_id);
CREATE INDEX IF NOT EXISTS idx_calculations_template_id ON public.calculations(template_id);
CREATE INDEX IF NOT EXISTS idx_calculations_capital_amount ON public.calculations(capital_amount);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON public.calculations(created_at);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);

-- 7. Políticas RLS (Row Level Security)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_tags ENABLE ROW LEVEL SECURITY;

-- Políticas para tags
CREATE POLICY "Users can manage their own tags" ON public.tags
  USING (user_id = (SELECT id FROM public.users WHERE roble_user_id = current_setting('app.current_user', true)));

-- Políticas para folders
CREATE POLICY "Users can manage their own folders" ON public.folders
  USING (user_id = (SELECT id FROM public.users WHERE roble_user_id = current_setting('app.current_user', true)));

-- Políticas para templates
CREATE POLICY "Users can manage their own templates" ON public.templates
  USING (user_id = (SELECT id FROM public.users WHERE roble_user_id = current_setting('app.current_user', true)) OR is_public = true);

-- Políticas para calculation_tags
CREATE POLICY "Users can manage their calculation tags" ON public.calculation_tags
  USING (calculation_id IN (
    SELECT id FROM public.calculations 
    WHERE user_id = (SELECT id FROM public.users WHERE roble_user_id = current_setting('app.current_user', true))
  ));

-- 8. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Función para extraer datos de form_data
CREATE OR REPLACE FUNCTION extract_calculation_data()
RETURNS TRIGGER AS $$
DECLARE
    form_data_obj JSONB;
BEGIN
    -- Extraer datos del form_data para facilitar búsquedas
    IF NEW.form_data IS NOT NULL THEN
        form_data_obj := NEW.form_data::JSONB;
        
        -- Extraer capital_amount
        IF form_data_obj ? 'capitalBase' THEN
            NEW.capital_amount := CAST(REPLACE(REPLACE(form_data_obj->>'capitalBase', '.', ''), ',', '') AS DECIMAL(15,2));
        END IF;
        
        -- Extraer interest_rate
        IF form_data_obj ? 'tasaMensual' THEN
            NEW.interest_rate := CAST(form_data_obj->>'tasaMensual' AS DECIMAL(5,4));
        END IF;
    END IF;
    
    -- Extraer total_interest del result_data si existe
    IF NEW.result_data IS NOT NULL THEN
        DECLARE
            result_obj JSONB;
        BEGIN
            result_obj := NEW.result_data::JSONB;
            IF result_obj ? 'totalInteresMora' THEN
                NEW.total_interest := CAST(REPLACE(REPLACE(result_obj->>'totalInteresMora', '.', ''), ',', '') AS DECIMAL(15,2));
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar errores de parsing
            NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER extract_calculation_data_trigger 
  BEFORE INSERT OR UPDATE ON public.calculations
  FOR EACH ROW EXECUTE FUNCTION extract_calculation_data();

-- 10. Vista para estadísticas de usuario
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(c.id) as total_calculations,
    COALESCE(SUM(c.capital_amount), 0) as total_capital,
    COALESCE(SUM(c.total_interest), 0) as total_interest,
    COALESCE(AVG(c.capital_amount), 0) as avg_capital,
    COUNT(DISTINCT DATE_TRUNC('month', c.created_at)) as active_months,
    MAX(c.created_at) as last_calculation_date
FROM public.users u
LEFT JOIN public.calculations c ON u.id = c.user_id
WHERE c.name NOT LIKE 'temp_%' OR c.name IS NULL
GROUP BY u.id, u.email;

-- 11. Función para obtener estadísticas por período
CREATE OR REPLACE FUNCTION get_calculations_by_period(
    p_user_id UUID,
    p_date_format TEXT DEFAULT 'YYYY-MM'
)
RETURNS TABLE (
    period TEXT,
    calculation_count BIGINT,
    total_capital DECIMAL(15,2),
    total_interest DECIMAL(15,2),
    avg_capital DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(c.created_at, p_date_format) as period,
        COUNT(c.id) as calculation_count,
        COALESCE(SUM(c.capital_amount), 0) as total_capital,
        COALESCE(SUM(c.total_interest), 0) as total_interest,
        COALESCE(AVG(c.capital_amount), 0) as avg_capital
    FROM public.calculations c
    WHERE c.user_id = p_user_id 
    AND c.name NOT LIKE 'temp_%'
    GROUP BY TO_CHAR(c.created_at, p_date_format)
    ORDER BY period DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios de documentación
COMMENT ON TABLE public.tags IS 'Etiquetas personalizables para categorizar cálculos';
COMMENT ON TABLE public.folders IS 'Carpetas jerárquicas para organizar cálculos';
COMMENT ON TABLE public.templates IS 'Plantillas predefinidas para cálculos recurrentes';
COMMENT ON TABLE public.calculation_tags IS 'Relación muchos-a-muchos entre cálculos y etiquetas';
COMMENT ON VIEW user_statistics IS 'Vista agregada con estadísticas de usuario';
