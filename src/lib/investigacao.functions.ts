export type ResultadoPlataforma = { id: string; nome: string; perfil: string; estado: "existe" | "livre" | "incerto" };
export async function rastrearUsuario({ data }: { data: { usuario: string } }) {
  const response = await fetch('/api/rastrear-usuario', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.erro || 'Falha na consulta.');
  return result as { lista: ResultadoPlataforma[] } | { erro: string };
}
