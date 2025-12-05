const Publication = require('../models/Publication');
const Faculty = require('../models/Faculty');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const addPublication = async (req, res) => {
  try {
    let citationId = req.body.citation_id;

    if (!citationId) {
      // generate one for manually added publications
      citationId = uuidv4(); 
    }

    // Get faculty ID from user
    const faculty = await Faculty.findOne({ _id: req.user._id });
    if (!faculty && req.user.role === 'faculty') {
      return res.status(404).json({ message: 'Faculty profile not found' });
    }

    const publication = new Publication({
      ...req.body,
      citation_id: citationId,
      facultyId: req.user.role === 'faculty' ? req.user._id : req.body.facultyId || undefined
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
    console.log(req.user)
    const { role, _id } = req.user;
    console.log("User role:", role, "User ID:", _id);

    if (!role || !_id) {
      return res.status(400).json({ message: "Missing user role or ID" });
    }

    let publications;

    if (role === "faculty") {
      // Map publications by facultyId instead of name
      publications = await Publication.find({ facultyId: _id });
    } else if (role === "admin" || role === "hod") {
      publications = await Publication.find().populate('facultyId', 'name email');
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.json(publications);
  } catch (err) {
    console.error("Error fetching publications:", err);
    res.status(500).json({ message: "Server error" });
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

const verifyGoogleScholarProfile = async (req, res) => {
  const authorId = req.query.authorId;
  const apiKey = process.env.SERP_API_KEY;

  if (!authorId) return res.status(400).json({ message: 'Author ID is required' });
  if (!apiKey) {
    return res.status(500).json({ message: 'SERP API key is not configured' });
  }

  try {
    const resp = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_scholar_author',
        author_id: authorId,
        api_key: apiKey,
        num: 1, // Just fetch one to verify profile exists
      },
    });

    const authorInfo = resp.data.author;
    if (!authorInfo) {
      return res.status(404).json({ message: 'Google Scholar profile not found' });
    }

    return res.json({
      verified: true,
      profile: {
        name: authorInfo.name,
        affiliation: authorInfo.affiliations,
        email: authorInfo.email,
        interests: authorInfo.interests,
        thumbnail: authorInfo.thumbnail,
        totalCitations: authorInfo.cited_by?.table?.[0]?.citations?.all || 0,
      }
    });
  } catch (error) {
    console.error('Failed to verify profile:', error?.response?.data || error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'Google Scholar profile not found' });
    }
    return res.status(500).json({ message: 'Failed to verify Google Scholar profile' });
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
  if (!apiKey) {
    console.error('SERP_API_KEY is not set in environment variables');
    return res.status(500).json({ message: 'SERP API key is not configured' });
  }

  // Get faculty ID from logged-in user
  const facultyId = req.user._id;
  if (!facultyId) {
    return res.status(400).json({ message: 'Faculty ID not found. Please ensure you are logged in.' });
  }

  console.log('Using SERP_API_KEY (first 5 chars):', apiKey.substring(0, 5));
  console.log('Fetching publications for authorId:', authorId);
  console.log('Mapping publications to facultyId:', facultyId);

  let totalFetched = [];
  let start = 0;

  try {
    while (true) {
      console.log('Making SerpAPI request with start:', start);
      const resp = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google_scholar_author',
          author_id: authorId,
          api_key: apiKey,
          start,
          num: 100,
        },
      });

      console.log('Full SerpAPI response data:', resp.data);

      if (!resp.data) {
        console.error('No data received from SerpAPI');
        return res.status(500).json({ message: 'No data received from SerpAPI' });
      }

      const articles = resp.data.articles || [];
      console.log(`Fetched ${articles.length} articles`);
      totalFetched = totalFetched.concat(articles);
      
      if (!resp.data.serpapi_pagination?.next || articles.length === 0) break;
      start += articles.length;
    }

    console.log(`Total articles fetched: ${totalFetched.length}`);

    let newCount = 0;
    for (const article of totalFetched) {
      console.log('Processing article:', article);
      try {
        const existing = await Publication.findOne({ citation_id: article.citation_id });
        if (existing) {
          // Update existing publication to include facultyId if not already set
          if (!existing.facultyId) {
            existing.facultyId = facultyId;
            await existing.save();
          }
          continue;
        }

        const newPub = new Publication({
          citation_id: article.citation_id,
          title: article.title,
          authors: article.authors.split(',').map(a => a.trim()),
          year: article.year ? parseInt(article.year) : new Date().getFullYear(),
          month: article.month ? parseInt(article.month) : undefined,
          volume: article.volume || undefined,
          issue: article.issue || undefined,
          journal: article.publication,
          doi: article.doi || undefined, // Set to undefined if DOI is not present
          facultyId: facultyId // Map to current logged-in faculty
        });

        await newPub.save();
        newCount++;
      } catch (saveError) {
        console.error('Error saving publication:', saveError);
        // Continue with next article even if one fails
      }
    }

    res.status(201).json({ message: `${newCount} new publications added and mapped to your faculty profile.` });
  } catch (err) {
    console.error('Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    res.status(500).json({ 
      message: 'Server error while fetching publications.',
      details: err.response?.data || err.message
    });
  }
};

module.exports = {
  addPublication,
  getAllPublications,
  updatePublication,
  deletePublication,
  verifyGoogleScholarProfile,
  fetchPublications,
  fetchAndStorePublications
};
