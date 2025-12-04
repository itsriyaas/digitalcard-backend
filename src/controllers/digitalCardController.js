import DigitalCard from '../models/DigitalCard.js';

// @desc    Create digital card
// @route   POST /api/digital-cards
// @access  Private (Customer)
export const createDigitalCard = async (req, res) => {
  try {
    const cardData = {
      ...req.body,
      user: req.user._id
    };

    const digitalCard = await DigitalCard.create(cardData);

    res.status(201).json({
      success: true,
      message: 'Digital card created successfully',
      data: digitalCard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all digital cards for logged-in user
// @route   GET /api/digital-cards
// @access  Private (Customer)
export const getUserDigitalCards = async (req, res) => {
  try {
    const digitalCards = await DigitalCard.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: digitalCards.length,
      data: digitalCards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single digital card by ID
// @route   GET /api/digital-cards/:id
// @access  Private (Customer - own cards only)
export const getDigitalCard = async (req, res) => {
  try {
    const digitalCard = await DigitalCard.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!digitalCard) {
      return res.status(404).json({
        success: false,
        message: 'Digital card not found'
      });
    }

    res.json({
      success: true,
      data: digitalCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get public digital card by slug
// @route   GET /api/digital-cards/public/:slug
// @access  Public
export const getPublicDigitalCard = async (req, res) => {
  try {
    const digitalCard = await DigitalCard.findOne({
      slug: req.params.slug,
      isPublished: true
    }).populate('user', 'name email');

    if (!digitalCard) {
      return res.status(404).json({
        success: false,
        message: 'Digital card not found'
      });
    }

    // Increment view count
    digitalCard.views += 1;
    await digitalCard.save();

    res.json({
      success: true,
      data: digitalCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update digital card
// @route   PUT /api/digital-cards/:id
// @access  Private (Customer - own cards only)
export const updateDigitalCard = async (req, res) => {
  try {
    const digitalCard = await DigitalCard.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!digitalCard) {
      return res.status(404).json({
        success: false,
        message: 'Digital card not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'user' && key !== 'slug') {
        digitalCard[key] = req.body[key];
      }
    });

    await digitalCard.save();

    res.json({
      success: true,
      message: 'Digital card updated successfully',
      data: digitalCard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete digital card
// @route   DELETE /api/digital-cards/:id
// @access  Private (Customer - own cards only)
export const deleteDigitalCard = async (req, res) => {
  try {
    const digitalCard = await DigitalCard.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!digitalCard) {
      return res.status(404).json({
        success: false,
        message: 'Digital card not found'
      });
    }

    res.json({
      success: true,
      message: 'Digital card deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle publish status
// @route   PATCH /api/digital-cards/:id/publish
// @access  Private (Customer - own cards only)
export const togglePublishStatus = async (req, res) => {
  try {
    const digitalCard = await DigitalCard.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!digitalCard) {
      return res.status(404).json({
        success: false,
        message: 'Digital card not found'
      });
    }

    digitalCard.isPublished = !digitalCard.isPublished;
    await digitalCard.save();

    res.json({
      success: true,
      message: `Digital card ${digitalCard.isPublished ? 'published' : 'unpublished'} successfully`,
      data: digitalCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Increment enquiry count
// @route   POST /api/digital-cards/:slug/enquiry
// @access  Public
export const recordEnquiry = async (req, res) => {
  try {
    const digitalCard = await DigitalCard.findOne({
      slug: req.params.slug,
      isPublished: true
    });

    if (!digitalCard) {
      return res.status(404).json({
        success: false,
        message: 'Digital card not found'
      });
    }

    digitalCard.enquiries += 1;
    await digitalCard.save();

    res.json({
      success: true,
      message: 'Enquiry recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
