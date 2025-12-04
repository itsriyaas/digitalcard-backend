// src/controllers/customerController.js
import User from "../models/User.js";

// =========================
// Get All Customers (Admin Only)
// =========================
export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password -otp -otpType -otpExpires')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// Get Single Customer (Admin Only)
// =========================
export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: 'customer'
    }).select('-password -otp -otpType -otpExpires');

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// Create Customer (Admin Only)
// =========================
export const createCustomer = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      company,
      address,
      subscription,
      catalogueLimit,
      cardLimit
    } = req.body;

    console.log('Creating customer with catalogueLimit:', catalogueLimit, typeof catalogueLimit);
    console.log('Creating customer with cardLimit:', cardLimit, typeof cardLimit);

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Prepare subscription data
    const subscriptionData = subscription ? {
      plan: subscription.plan || 'none',
      status: subscription.status || 'pending',
      startDate: subscription.startDate || null,
      endDate: subscription.endDate || null,
      autoRenew: subscription.autoRenew || false,
      paymentId: subscription.paymentId || null,
      amount: subscription.amount || 0
    } : {
      plan: 'none',
      status: 'pending',
      startDate: null,
      endDate: null,
      autoRenew: false,
      paymentId: null,
      amount: 0
    };

    // Prepare address data
    const addressData = address ? {
      street: address.street || null,
      city: address.city || null,
      state: address.state || null,
      country: address.country || null,
      zipCode: address.zipCode || null
    } : {
      street: null,
      city: null,
      state: null,
      country: null,
      zipCode: null
    };

    // Create customer
    const customer = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'customer',
      phone: phone || null,
      company: company || null,
      address: addressData,
      subscription: subscriptionData,
      catalogueLimit: catalogueLimit !== undefined ? catalogueLimit : -1,
      cardLimit: cardLimit !== undefined ? cardLimit : -1,
      isActive: true
    });

    console.log('Customer created with catalogueLimit:', customer.catalogueLimit);
    console.log('Customer created with cardLimit:', customer.cardLimit);

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role,
        phone: customer.phone,
        company: customer.company,
        address: customer.address,
        subscription: customer.subscription,
        catalogueLimit: customer.catalogueLimit,
        cardLimit: customer.cardLimit,
        isActive: customer.isActive
      }
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// Update Customer (Admin Only)
// =========================
export const updateCustomer = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      company,
      address,
      isActive,
      subscription,
      catalogueLimit,
      cardLimit
    } = req.body;

    console.log('Updating customer with catalogueLimit:', catalogueLimit, typeof catalogueLimit);
    console.log('Updating customer with cardLimit:', cardLimit, typeof cardLimit);

    const customer = await User.findOne({
      _id: req.params.id,
      role: 'customer'
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Update fields
    if (name) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (company !== undefined) customer.company = company;
    if (address) {
      customer.address = {
        street: address.street || customer.address?.street || null,
        city: address.city || customer.address?.city || null,
        state: address.state || customer.address?.state || null,
        country: address.country || customer.address?.country || null,
        zipCode: address.zipCode || customer.address?.zipCode || null
      };
    }
    if (isActive !== undefined) customer.isActive = isActive;
    if (catalogueLimit !== undefined) {
      customer.catalogueLimit = catalogueLimit;
      console.log('Set catalogueLimit to:', customer.catalogueLimit);
    }
    if (cardLimit !== undefined) {
      customer.cardLimit = cardLimit;
      console.log('Set cardLimit to:', customer.cardLimit);
    }

    // Update subscription if provided
    if (subscription) {
      customer.subscription = {
        plan: subscription.plan || customer.subscription?.plan || 'none',
        status: subscription.status || customer.subscription?.status || 'pending',
        startDate: subscription.startDate || customer.subscription?.startDate || null,
        endDate: subscription.endDate || customer.subscription?.endDate || null,
        autoRenew: subscription.autoRenew !== undefined ? subscription.autoRenew : customer.subscription?.autoRenew || false,
        paymentId: subscription.paymentId || customer.subscription?.paymentId || null,
        amount: subscription.amount !== undefined ? subscription.amount : customer.subscription?.amount || 0
      };
    }

    await customer.save();

    console.log('Customer saved with catalogueLimit:', customer.catalogueLimit);
    console.log('Customer saved with cardLimit:', customer.cardLimit);

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role,
        phone: customer.phone,
        company: customer.company,
        address: customer.address,
        subscription: customer.subscription,
        catalogueLimit: customer.catalogueLimit,
        cardLimit: customer.cardLimit,
        isActive: customer.isActive
      }
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// Delete Customer (Admin Only)
// =========================
export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'customer'
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// Update Customer Subscription (Admin Only)
// =========================
export const updateSubscription = async (req, res, next) => {
  try {
    const { plan, status, startDate, endDate, autoRenew, amount } = req.body;

    const customer = await User.findOne({
      _id: req.params.id,
      role: 'customer'
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Calculate end date based on plan if not provided
    let calculatedEndDate = endDate;
    if (startDate && !endDate && plan !== 'none') {
      const start = new Date(startDate);
      if (plan === 'monthly') {
        calculatedEndDate = new Date(start.setMonth(start.getMonth() + 1));
      } else if (plan === 'yearly') {
        calculatedEndDate = new Date(start.setFullYear(start.getFullYear() + 1));
      }
    }

    // Update subscription
    customer.subscription = {
      plan: plan || customer.subscription.plan,
      status: status || customer.subscription.status,
      startDate: startDate || customer.subscription.startDate,
      endDate: calculatedEndDate || customer.subscription.endDate,
      autoRenew: autoRenew !== undefined ? autoRenew : customer.subscription.autoRenew,
      amount: amount !== undefined ? amount : customer.subscription.amount
    };

    await customer.save();

    res.json({
      success: true,
      message: "Subscription updated successfully",
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        subscription: customer.subscription
      }
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// Toggle Customer Active Status (Admin Only)
// =========================
export const toggleCustomerStatus = async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: 'customer'
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.isActive = !customer.isActive;
    await customer.save();

    res.json({
      success: true,
      message: `Customer ${customer.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        isActive: customer.isActive
      }
    });
  } catch (err) {
    next(err);
  }
};
