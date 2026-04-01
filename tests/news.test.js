const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");
const NewsModel = require("../Models/News");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Gaming News API - Full Integration Suite", () => {
  let sharedId;

  describe("POST /news", () => {
    it("should create a valid news article", async () => {
      const payload = {
        title: "Fallout New Vegasn't: A Satire",
        text: "Exploring the Mojave that never was.",
        image: "https://images.com/fnv.jpg",
        category: "RPG",
        author: "Pablo",
        type: "Analysis"
      };
      const res = await request(app).post("/news").send(payload);
      expect(res.statusCode).toBe(201);
      expect(res.body.article).toHaveProperty("_id");
      sharedId = res.body.article._id;
    });

    it("should fail (400) if required fields are missing", async () => {
      const res = await request(app).post("/news").send({ author: "Pablo" });
      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /news (List & Pagination)", () => {
    beforeAll(async () => {
      const testArticles = Array.from({ length: 15 }).map((_, i) => ({
        title: `News Article ${i}`,
        text: "Content body",
        image: "https://images.com/test.jpg",
        category: i % 2 === 0 ? "Action" : "Indie",
        author: "PaginationBot",
        type: "News"
      }));
      await NewsModel.insertMany(testArticles);
    });

    it("should return paginated results with metadata", async () => {
      const res = await request(app).get("/news?page=1&limit=5");
      
      expect(res.statusCode).toBe(200);
      expect(res.body.newsList.length).toBe(5);
      expect(res.body).toHaveProperty("totalNewsCount");
      expect(res.body.currentPage).toBe(1);
      expect(res.body.hasNextPage).toBe(true);
    });

    it("should correctly skip items on page 2", async () => {
      const p1 = await request(app).get("/news?page=1&limit=5");
      const p2 = await request(app).get("/news?page=2&limit=5");
      
      expect(p2.body.newsList[0]._id).not.toBe(p1.body.newsList[0]._id);
      expect(p2.body.currentPage).toBe(2);
    });
  });

  describe("GET /news/category", () => {
    it("should filter by specific category", async () => {
      const res = await request(app).get("/news/category?category=RPG&limit=5");
      expect(res.statusCode).toBe(200);
      expect(res.body.newsList.some(n => n.category === "RPG")).toBe(true);
    });

    it("should return a clear error for non-existent categories", async () => {
      const res = await request(app).get("/news/category?category=Cooking&limit=5");
      expect(res.body.error).toBe("Category does not exist");
      expect(res.body.newsList).toHaveLength(0);
    });
  });

  describe("GET /news/:id", () => {
    it("should fetch an article by its ID", async () => {
      const res = await request(app).get(`/news/${sharedId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.article.title).toContain("Fallout");
    });

    it("should 404 for missing IDs", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/news/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });
  });
});