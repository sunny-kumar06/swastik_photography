const Contact = require('../models/Contact');
const { sendContactNotification } = require('../utils/emailService');

// @desc    Submit contact message (Public)
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const newContact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      message: message.trim(),
    });

    // Send email notification in background
    sendContactNotification(newContact).catch((err) => {
      console.error('[Background Email Error]:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been received! Our team will contact you shortly.',
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
// @access  Private (Admin)
const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark contact message as read (Admin)
// @route   PUT /api/contact/:id/read
// @access  Private (Admin)
const markContactAsRead = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    contact.isRead = true;
    await contact.save();

    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact message (Admin)
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    await contact.deleteOne();
    res.json({ success: true, message: 'Message deleted successfully', data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactForm,
  getAllContacts,
  markContactAsRead,
  deleteContact,
};
