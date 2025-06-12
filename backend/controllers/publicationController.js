const Publication = require('../models/Publication');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const addPublication = async (req, res) => {
  try {
    let citationId = req.body.citation_id;

    if (!citationId) {
      // generate one for manually added publications
      citationId = uuidv4(); 
    }

    const publication = new Publication({
      ...req.body,
      citation_id: citationId
    });

    const saved = await publication.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate citation_id detected' });
    }
    res.status(400).json({ message: err.message });
  }
};


const getAllPublications = async (req, res) => {
  try {
    const publications = await Publication.find();
    res.json(publications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePublication = async (req, res) => {
  try {
    const updated = await Publication.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: 'Publication not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const deletePublication = async (req, res) => {
  try {
    const deleted = await Publication.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Publication not found' });
    res.json({ message: 'Publication deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const fetchPublications = async (req, res) => {
  const authorId = req.query.authorId;
  const apiKey = process.env.SERP_API_KEY;

  if (!authorId) return res.status(400).json({ message: 'Author ID is required' });

  let totalPublications = [];
  let start = 0;

  try {
    while (true) {
      const resp = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google_scholar_author',
          author_id: authorId,
          api_key: apiKey,
          start: start,
          num: 100,
        },
      });

      const publications = resp.data.articles || [];
      console.log(`Start: ${start}, Fetched: ${publications.length}`);
      totalPublications = totalPublications.concat(publications);

      const nextLink = resp.data.serpapi_pagination?.next;

    
      if (!nextLink || publications.length === 0) break;

      start += publications.length;
    }

    return res.json({ publications: totalPublications });
  } catch (error) {
    console.error('Failed to fetch publications:', error?.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to fetch publications' });
  }
};

const fetchAndStorePublications = async (req, res) => {
  const authorId = req.query.authorId;
  const apiKey = process.env.SERP_API_KEY;

  if (!authorId) return res.status(400).json({ message: 'Author ID is required' });

  let totalFetched = [];
  let start = 0;

  try {
    while (true) {
      const resp = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google_scholar_author',
          author_id: authorId,
          api_key: apiKey,
          start,
          num: 100,
        },
      });

      const articles = resp.data.articles || [];
      totalFetched = totalFetched.concat(articles);
      if (!resp.data.serpapi_pagination?.next || articles.length === 0) break;
      start += articles.length;
    }

    let newCount = 0;
    for (const article of totalFetched) {
      const existing = await Publication.findOne({ citation_id: article.citation_id });
      if (existing) continue;

      const newPub = new Publication({
        citation_id: article.citation_id,
        title: article.title,
        authors: article.authors.split(',').map(a => a.trim()),
        publicationDate: article.year ? new Date(`${article.year}-01-01`) : new Date(),
        journal: article.publication,
        doi: '' // Optional: extract if present in article (SerpAPI might not give it)
      });

      await newPub.save();
      newCount++;
    }

    res.status(201).json({ message: `${newCount} new publications added.` });
  } catch (err) {
    console.error('Error fetching/storing publications:', err.message);
    res.status(500).json({ message: 'Server error while fetching publications.' });
  }
};

module.exports = {
  addPublication,
  getAllPublications,
  updatePublication,
  deletePublication,
  fetchPublications,
  fetchAndStorePublications
};
