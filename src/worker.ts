export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
