import swaggerJsdoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Affiliate Bot API",
      version: "2.1.0",
      description:
        "REST API cho Affiliate Bot — tạo nội dung affiliate marketing đa nền tảng (TikTok, YouTube, Facebook Reels, Instagram Reels, Facebook Ads)",
      contact: {
        name: "GitHub",
        url: "https://github.com/hoanglongle88/affiliate-bot-cli",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    tags: [
      { name: "Health", description: "Health check" },
      { name: "Scripts", description: "Video script management" },
      { name: "Captions", description: "Caption/description generation" },
      { name: "Products", description: "Product CRUD + import/export" },
      { name: "Trends", description: "Trend research" },
      { name: "History", description: "Content history" },
      { name: "Short", description: "Short video prompts (Veo)" },
      { name: "Image", description: "Image ad briefs" },
      { name: "Stats", description: "Dashboard statistics" },
    ],
    paths: {
      // ── Health ──
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": {
              description: "Server is running",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      timestamp: { type: "string" },
                      uptime: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ── Scripts ──
      "/api/scripts": {
        post: {
          tags: ["Scripts"],
          summary: "Create a new video script",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["product", "platform"],
                  properties: {
                    product: {
                      type: "object",
                      required: ["name", "description"],
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        price: { type: "string" },
                        rating: { type: "string" },
                        sold: { type: "string" },
                        usp: { type: "string" },
                      },
                    },
                    platform: {
                      type: "string",
                      enum: [
                        "tiktok",
                        "youtube",
                        "facebook_reels",
                        "instagram_reels",
                        "facebook_ads",
                      ],
                    },
                    productId: { type: "string", nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Script created" },
            "400": { description: "Validation error" },
            "500": { description: "Server error" },
          },
        },
      },
      "/api/scripts/history": {
        get: {
          tags: ["Scripts"],
          summary: "List scripts with pagination",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
            { name: "platform", in: "query", schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "List of scripts" },
          },
        },
      },
      "/api/scripts/{id}": {
        get: {
          tags: ["Scripts"],
          summary: "Get script by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Script details" },
            "404": { description: "Not found" },
          },
        },
        delete: {
          tags: ["Scripts"],
          summary: "Delete a script",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Deleted" },
            "404": { description: "Not found" },
          },
        },
      },
      "/api/scripts/{id}/regenerate": {
        post: {
          tags: ["Scripts"],
          summary: "Regenerate script (keeps same ID)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Script regenerated" },
            "400": { description: "Cannot regenerate (no product linked)" },
            "404": { description: "Not found" },
          },
        },
      },
      "/api/scripts/bulk-delete": {
        post: {
          tags: ["Scripts"],
          summary: "Delete multiple scripts (max 100 IDs)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["ids"],
                  properties: {
                    ids: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Deleted count" },
            "400": { description: "Invalid request" },
          },
        },
      },
      "/api/scripts/export": {
        post: {
          tags: ["Scripts"],
          summary: "Export scripts to TXT file",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ids: { type: "array", items: { type: "string" } },
                    platform: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "TXT file download",
              content: { "text/plain": { schema: { type: "string" } } },
            },
          },
        },
      },

      // ── Products ──
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "List products with pagination",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
            {
              name: "q",
              in: "query",
              description: "Search query",
              schema: { type: "string" },
            },
            {
              name: "sort",
              in: "query",
              schema: {
                type: "string",
                enum: [
                  "date_desc",
                  "date_asc",
                  "name_asc",
                  "name_desc",
                  "usage_desc",
                  "usage_asc",
                ],
              },
            },
          ],
          responses: {
            "200": { description: "List of products" },
          },
        },
        post: {
          tags: ["Products"],
          summary: "Create a product",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "description"],
                  properties: {
                    name: { type: "string", maxLength: 200 },
                    description: { type: "string", maxLength: 2000 },
                    price: { type: "string" },
                    rating: { type: "string" },
                    sold: { type: "string" },
                    usp: { type: "string", maxLength: 500 },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Product created" },
            "400": { description: "Validation error" },
          },
        },
        delete: {
          tags: ["Products"],
          summary: "⚠️ Delete ALL products (cascade)",
          responses: {
            "200": { description: "All products deleted" },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get product by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Product details" },
            "404": { description: "Not found" },
          },
        },
        put: {
          tags: ["Products"],
          summary: "Update product by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "description"],
                  properties: {
                    name: { type: "string", maxLength: 200 },
                    description: { type: "string", maxLength: 2000 },
                    price: { type: "string" },
                    rating: { type: "string" },
                    sold: { type: "string" },
                    usp: { type: "string", maxLength: 500 },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Product updated" },
            "400": { description: "Validation error" },
            "404": { description: "Not found" },
          },
        },
        delete: {
          tags: ["Products"],
          summary: "Delete a product",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Deleted" },
            "404": { description: "Not found" },
          },
        },
      },
      "/api/products/bulk-delete": {
        post: {
          tags: ["Products"],
          summary: "Delete multiple products (max 100 IDs)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["ids"],
                  properties: {
                    ids: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Deleted count" },
            "400": { description: "Invalid request" },
          },
        },
      },
      "/api/products/export": {
        get: {
          tags: ["Products"],
          summary: "Export all products as CSV",
          responses: {
            "200": {
              description: "CSV file download",
              content: { "text/csv": { schema: { type: "string" } } },
            },
          },
        },
      },
      "/api/products/import": {
        post: {
          tags: ["Products"],
          summary: "Import products from CSV",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["csvContent"],
                  properties: {
                    csvContent: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Import result" },
            "400": { description: "Missing csvContent" },
          },
        },
      },

      // ── Captions ──
      "/api/captions": {
        post: {
          tags: ["Captions"],
          summary: "Generate caption/description",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product: { type: "object" },
                    platform: { type: "string" },
                    productId: { type: "string", nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Caption generated" },
          },
        },
      },

      // ── Trends ──
      "/api/trends/scan": {
        post: {
          tags: ["Trends"],
          summary: "Scan trend for products",
          responses: {
            "200": { description: "Trend scan result" },
          },
        },
      },

      // ── History ──
      "/api/history": {
        get: {
          tags: ["History"],
          summary: "List history entries",
          responses: {
            "200": { description: "List of history entries" },
          },
        },
      },
      "/api/history/{id}": {
        delete: {
          tags: ["History"],
          summary: "Delete a history entry",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Deleted" },
          },
        },
      },

      // ── Short ──
      "/api/short": {
        post: {
          tags: ["Short"],
          summary: "Generate short video prompt (Veo)",
          responses: {
            "200": { description: "Short video prompt generated" },
          },
        },
      },

      // ── Image ──
      "/api/image": {
        post: {
          tags: ["Image"],
          summary: "Generate image ad brief",
          responses: {
            "200": { description: "Image brief generated" },
          },
        },
      },

      // ── Stats ──
      "/api/stats": {
        get: {
          tags: ["Stats"],
          summary: "Dashboard statistics",
          responses: {
            "200": { description: "Stats data" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
