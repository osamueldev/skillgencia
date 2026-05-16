/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {

  // users auth collection (required for login)
  let usersCol;
  try {
    usersCol = app.findCollectionByNameOrId("users");
  } catch (_) {
    usersCol = new Collection({ name: "users", type: "auth" });
    app.save(usersCol);
  }

  // clients
  const clients = new Collection({
    name: "clients",
    type: "base",
    fields: [
      { name: "name",         type: "text", required: true },
      { name: "slug",         type: "text", required: true },
      { name: "logo",         type: "file", maxSelect: 1 },
      { name: "brand_colors", type: "json" },
      { name: "brand_fonts",  type: "json" },
      { name: "brand_assets", type: "file", maxSelect: 10 },
      { name: "created_by",   type: "text" }
    ]
  });
  app.save(clients);

  // meta_connections
  const metaConnections = new Collection({
    name: "meta_connections",
    type: "base",
    fields: [
      { name: "client",       type: "text", required: true },
      { name: "platform",     type: "select", required: true, values: ["instagram", "facebook"] },
      { name: "access_token", type: "text",   required: true },
      { name: "page_id",      type: "text",   required: true },
      { name: "account_id",   type: "text",   required: true },
      { name: "expires_at",   type: "date" }
    ]
  });
  app.save(metaConnections);

  // posts
  const posts = new Collection({
    name: "posts",
    type: "base",
    fields: [
      { name: "client",       type: "text",   required: true },
      { name: "platform",     type: "select", required: true, values: ["instagram", "facebook"] },
      { name: "content",      type: "text" },
      { name: "media",        type: "file",   maxSelect: 10 },
      { name: "status",       type: "select", required: true, values: ["draft", "scheduled", "published", "failed"] },
      { name: "scheduled_at", type: "date" },
      { name: "published_at", type: "date" },
      { name: "meta_post_id", type: "text" },
      { name: "created_by",   type: "text" }
    ]
  });
  app.save(posts);

  // metrics_cache
  const metricsCache = new Collection({
    name: "metrics_cache",
    type: "base",
    fields: [
      { name: "client",       type: "text", required: true },
      { name: "platform",     type: "text", required: true },
      { name: "period_start", type: "date", required: true },
      { name: "period_end",   type: "date", required: true },
      { name: "data",         type: "json" },
      { name: "fetched_at",   type: "date", required: true }
    ]
  });
  app.save(metricsCache);

}, (app) => {
  for (const name of ["metrics_cache", "posts", "meta_connections", "clients"]) {
    try { app.delete(app.findCollectionByNameOrId(name)); } catch (_) {}
  }
});
