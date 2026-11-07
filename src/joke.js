export async function getJoke(fetchClient = globalThis.fetch) {
  const res = await fetchClient("https://icanhazdadjoke.com/", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "GitHub Skills Write JavaScript Actions exercise",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error("Joke API returned HTTP " + res.status);
  }

  const data = await res.json();
  const joke = typeof data?.joke === "string" ? data.joke.trim() : "";
  if (!joke) throw new Error("Joke API returned an empty joke");
  return joke;
}
