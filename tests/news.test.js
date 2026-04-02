const request    = require('supertest')
const mongoose   = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const app        = require('../server')
const NewsModel  = require('../Models/News')

// ── Fixtures ───────────────────────────────────────────────────────────────

const makeArticle = (overrides = {}) => ({
  title:    'Fallout New Vegasn\'t: A Satire',
  text:     'Exploring the Mojave that never was.',
  image:    'https://images.com/fnv.jpg',
  category: 'RPG',
  author:   'Pablo',
  type:     'Analysis',
  ...overrides,
})

const VALID_API_KEY = process.env.ADMIN_API_KEY ?? 'test-key'

// ── Setup ──────────────────────────────────────────────────────────────────

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  await NewsModel.deleteMany({})
})

// ── Suite ──────────────────────────────────────────────────────────────────

describe('Gaming News API', () => {
  let sharedId

  // ── POST /news ────────────────────────────────────────────────────────

  describe('POST /news', () => {
    it('creates a valid article and returns 201', async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', VALID_API_KEY)
        .send(makeArticle())

      expect(res.statusCode).toBe(201)
      expect(res.body.article).toMatchObject({
        title:    'Fallout New Vegasn\'t: A Satire',
        category: 'RPG',
        author:   'Pablo',
      })
      expect(res.body.article._id).toBeDefined()
      sharedId = res.body.article._id
    })

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', VALID_API_KEY)
        .send({ author: 'Pablo' })

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBeDefined()
    })

    it('returns 400 when image is not a valid URL', async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', VALID_API_KEY)
        .send(makeArticle({ image: 'not-a-url' }))

      expect(res.statusCode).toBe(400)
    })

    it('returns 401 when API key is missing', async () => {
      const res = await request(app)
        .post('/news')
        .send(makeArticle())

      expect(res.statusCode).toBe(401)
    })

    it('returns 401 when API key is wrong', async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', 'wrong-key')
        .send(makeArticle())

      expect(res.statusCode).toBe(401)
    })
  })

  // ── GET /news ─────────────────────────────────────────────────────────

  describe('GET /news', () => {
    beforeEach(async () => {
      const articles = Array.from({ length: 15 }, (_, i) =>
        makeArticle({
          title:    `News Article ${i}`,
          category: i % 2 === 0 ? 'Action' : 'Indie',
          author:   'PaginationBot',
          type:     'News',
        })
      )
      await NewsModel.insertMany(articles)
    })

    it('returns paginated results with correct metadata', async () => {
      const res = await request(app).get('/news?page=1&limit=5')

      expect(res.statusCode).toBe(200)
      expect(res.body.newsList).toHaveLength(5)
      expect(res.body.totalNewsCount).toBe(15)
      expect(res.body.currentPage).toBe(1)
      expect(res.body.totalPages).toBe(3)
      expect(res.body.hasNextPage).toBe(true)
    })

    it('returns different items on page 2', async () => {
      const p1 = await request(app).get('/news?page=1&limit=5')
      const p2 = await request(app).get('/news?page=2&limit=5')

      const p1Ids = p1.body.newsList.map(n => n._id)
      const p2Ids = p2.body.newsList.map(n => n._id)

      expect(p2.body.currentPage).toBe(2)
      expect(p2Ids.some(id => p1Ids.includes(id))).toBe(false)
    })

    it('returns hasNextPage=false on the last page', async () => {
      const res = await request(app).get('/news?page=3&limit=5')

      expect(res.body.hasNextPage).toBe(false)
      expect(res.body.newsList).toHaveLength(5)
    })

    it('defaults to page 1 and limit 10 when params are omitted', async () => {
      const res = await request(app).get('/news')

      expect(res.statusCode).toBe(200)
      expect(res.body.newsList).toHaveLength(10)
      expect(res.body.currentPage).toBe(1)
    })
  })

  // ── GET /news/category ────────────────────────────────────────────────

  describe('GET /news/category', () => {
    beforeEach(async () => {
      await NewsModel.insertMany([
        makeArticle({ category: 'RPG',    title: 'RPG Article 1' }),
        makeArticle({ category: 'RPG',    title: 'RPG Article 2' }),
        makeArticle({ category: 'Action', title: 'Action Article' }),
      ])
    })

    it('filters by category and returns only matching articles', async () => {
      const res = await request(app).get('/news/category?category=RPG&limit=10')

      expect(res.statusCode).toBe(200)
      expect(res.body.newsList).toHaveLength(2)
      expect(res.body.newsList.every(n => n.category === 'RPG')).toBe(true)
      expect(res.body.categoryCount).toBe(2)
    })

    it('is case-insensitive', async () => {
      const res = await request(app).get('/news/category?category=rpg&limit=10')

      expect(res.statusCode).toBe(200)
      expect(res.body.newsList).toHaveLength(2)
    })

    it('returns all articles when no category is provided', async () => {
      const res = await request(app).get('/news/category?limit=10')

      expect(res.statusCode).toBe(200)
      expect(res.body.newsList).toHaveLength(3)
    })

    it('returns error message for non-existent category', async () => {
      const res = await request(app).get('/news/category?category=Cooking&limit=5')

      expect(res.body.error).toBe('Category does not exist')
      expect(res.body.newsList).toHaveLength(0)
    })
  })

  // ── GET /news/:id ─────────────────────────────────────────────────────

  describe('GET /news/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', VALID_API_KEY)
        .send(makeArticle())
      sharedId = res.body.article._id
    })

    it('fetches an article by ID', async () => {
      const res = await request(app).get(`/news/${sharedId}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.article.title).toContain('Fallout')
      expect(res.body.article._id).toBe(sharedId)
    })

    it('returns 404 for a valid but non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const res    = await request(app).get(`/news/${fakeId}`)

      expect(res.statusCode).toBe(404)
      expect(res.body.error).toBe('Article not found')
    })

    it('returns 400 for a malformed ID', async () => {
      const res = await request(app).get('/news/not-a-valid-id')

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Invalid article ID')
    })
  })

  // ── GET /health ───────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('returns status ok', async () => {
      const res = await request(app).get('/health')

      expect(res.statusCode).toBe(200)
      expect(res.body.status).toBe('ok')
    })
  })
})