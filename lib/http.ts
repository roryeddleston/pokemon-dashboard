export async function readJson<T>(req: Request): Promise<T> {
  return (await req.json()) as T;
}
