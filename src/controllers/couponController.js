import Coupon from '../models/Coupon.js';
import Catalogue from '../models/Catalogue.js';

// @desc    Create coupon
// @route   POST /api/coupon
// @access  Private
export const createCoupon = async (req, res) => {
  try {
    // Verify catalogue ownership
    const catalogue = await Catalogue.findOne({
      _id: req.body.catalogue,
      user: req.user._id
    });

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found'
      });
    }

    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get coupons by catalogue
// @route   GET /api/coupons/:catalogueId
// @access  Private
export const getCouponsByCatalogue = async (req, res) => {
  try {
    const { catalogueId } = req.params;

    // Verify catalogue ownership
    const catalogue = await Catalogue.findOne({
      _id: catalogueId,
      user: req.user._id
    });

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found'
      });
    }

    const coupons = await Coupon.find({ catalogue: catalogueId })
      .populate('applicableProducts', 'title')
      .populate('applicableCategories', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Validate coupon
// @route   POST /api/coupon/validate
// @access  Public
export const validateCoupon = async (req, res) => {
  try {
    const { code, catalogueId, cartTotal } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      catalogue: catalogueId
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid coupon code'
      });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Coupon has expired or reached usage limit'
      });
    }

    if (cartTotal < coupon.minCartValue) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Minimum cart value of ${coupon.minCartValue} required`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      valid: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        finalTotal: cartTotal - discount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupon/:id
// @access  Private
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('catalogue');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Verify ownership
    const catalogue = await Catalogue.findOne({
      _id: coupon.catalogue._id,
      user: req.user._id
    });

    if (!catalogue) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCoupon
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupon/:id
// @access  Private
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('catalogue');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Verify ownership
    const catalogue = await Catalogue.findOne({
      _id: coupon.catalogue._id,
      user: req.user._id
    });

    if (!catalogue) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await coupon.deleteOne();

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
