const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const Order = require('./order');
exports.sendInvoiceEmail = async (req, res) => {

  const { orderId, customerEmail } = req.body;
  if (!orderId || !customerEmail) {
    return res.status(400).json({ error: 'orderId and customerEmail are required' });
  }

  // 1. Fetch the order
const order = await Order
  .findOne({ id: orderId })   // look up by your custom `id` property
  .lean();
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // 2. Generate PDF invoice in‑memory
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', async () => {
    const pdfData = Buffer.concat(buffers);

    // 3. Configure Nodemailer transporter

    const auth = nodemailer.createTransport({
      service: "gmail",
      port:  465,
      secure: true,                    // true for 465, false for other ports
      auth: {
        user: 'foodieshub11@gmail.com',
        pass: 'maam uetv yznm gupd'
      },
    });

    const receiver = {
        from: '"Foodies Hub" <foodieshub11@gmail.com>',
        to: customerEmail,
        subject: `Your Invoice for Order ${order._id}`,
        text: `Hi ${order.name},\n\nThank you for your order! Please find your invoice attached.\n\nCheers,`,
        attachments: [
          {
            filename: `invoice-${order._id}.pdf`,
            content: pdfData,
          },
        ],
    }

    try {
      let info = await auth.sendMail(receiver);
      console.log('📨 Message sent: %s', info.messageId);
      return res.json({ success: true, messageId: info.messageId });
    } catch (err) {
      console.error('Mail error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }

  });

  // 2a. Fill out your PDF (simple example)
  doc.fontSize(20).text('INVOICE', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.timestamp).toLocaleString()}`);
  doc.moveDown();
  doc.text(`Customer: ${order.name}`);
  doc.text(`Phone: ${order.phone}`);
  doc.text(`Address: ${order.address}`);
  doc.moveDown();

  // Table header
  doc.font('Helvetica-Bold');
  doc.text('Item', 50);
  doc.text('Qty', 250);
  doc.text('Price', 300);
  doc.text('Total', 370);
  doc.font('Helvetica').moveDown(0.5);

  // Table rows
  order.products.forEach(p => {
    doc.text(p.name, 50);
    doc.text(p.quantity.toString(), 250);
    doc.text(`₹${p.price.toFixed(2)}`, 300);
    doc.text(`₹${(p.price * p.quantity).toFixed(2)}`, 370);
    doc.moveDown(0.2);
  });

  doc.moveDown();
  const subTotal = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  doc.text(`Subtotal: ₹${subTotal.toFixed(2)}`, { align: 'right' });
  if (order.delivery) {
    doc.text(`Delivery: +₹${order.delivery.toFixed(2)}`, { align: 'right' });
  }
  if (order.discount) {
    doc.text(`Discount: -₹${order.discount.toFixed(2)}`, { align: 'right' });
  }
  const net = subTotal + (order.delivery || 0) - (order.discount || 0);
  doc.text(`Total: ₹${net.toFixed(2)}`, { align: 'right' });

  doc.end();
};
