CREATE POLICY "public update expenses" ON public.expenses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete expenses" ON public.expenses FOR DELETE USING (true);