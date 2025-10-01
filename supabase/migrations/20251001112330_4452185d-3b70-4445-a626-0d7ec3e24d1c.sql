-- Remover política restritiva que bloqueia inserções públicas
DROP POLICY IF EXISTS "Allow service role to insert donations" ON public.donations;

-- Garantir que a política de inserção pública existe e está correta
DROP POLICY IF EXISTS "Anyone can insert donations" ON public.donations;

CREATE POLICY "Anyone can insert donations"
ON public.donations
FOR INSERT
WITH CHECK (true);

-- Manter as outras políticas para usuários autenticados
DROP POLICY IF EXISTS "Authenticated users can view all donations" ON public.donations;
DROP POLICY IF EXISTS "Authenticated users can update donations" ON public.donations;

CREATE POLICY "Authenticated users can view all donations"
ON public.donations
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update donations"
ON public.donations
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);