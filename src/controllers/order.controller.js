// -- Services
import {
  createOrder,
  getLastOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteAttachOrder,
} from "../services/order.services.js";

// -- Utils
import logger from "../utils/logger.js";
import config from "../config/dot.js";

// -- Errors
import CustomError from "../errors/CustomError.js";
import EErrors from "../errors/enums.js";

// -- Modules
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import htmlPdf from "html-pdf";

// -- Templates
import { pdfTemplate } from "../templates/pdf.templates.js";
import { pdf2Template } from "../templates/pdf2.templates.js";

// -- Local Variables
// let browser;

// const initializeBrowser = async () => {
//   if (!browser) {
//     browser = await puppeteer.launch({
//       // headless: true,
//       // args: ["--no-sandbox", "--disable-setuid-sandbox"],
//       args: chromium.args,
//       executablePath: await chromium.executablePath,
//       headless: chromium.headless,
//     });
//   }
// };

// -- Local Functions
const serieIncrement = (lastOrder) => {
  try {
    const [prefijo, num] = lastOrder.split("-");

    let newNum = parseInt(num, 10) + 1;

    let newPrefijo = prefijo;

    if (newNum > 99999999) {
      newNum = 1;
      newPrefijo = String.fromCharCode(prefijo.charCodeAt(0) + 1);
    }

    let formatNum = newNum.toString().padStart(8, "0");

    return `${newPrefijo}-${formatNum}`;
  } catch (error) {
    logger.error(`Error al incrementar la serie: ${error.message}`);
    return null;
  }
};

const createHtmlPDF = async (order) => {
  try {
    const options = {
      format: "A4",
    };

    const attachBuffer = new Promise((resolve, reject) => {
      htmlPdf.create(pdf2Template(order), options).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });

    return attachBuffer;
  } catch (error) {
    console.error(`Error al crear el PDF: ${error.message}`);
  }
};

// Puppeteer - almacena en Buffer
const createPDFPuppeteer = async (order) => {
  try {
    await initializeBrowser();
    const page = await browser.newPage();
    await page.setContent(pdf2Template(order));

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await page.close();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    logger.error(`Error al crear el PDF: ${error.message}`);
    return null;
  }
};

// PDFKit - Almacenar en base64
const createPDF = async (order) => {
  const doc = new PDFDocument();
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));

  return new Promise((resolve, reject) => {
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      const base64PDF = pdfBuffer.toString("base64");
      resolve(base64PDF);
    });
    doc.on("error", reject);

    // Encabezado
    doc.fontSize(20).text(`Remito #${order.serie}`, { align: "center" });
    doc.moveDown();

    // Información del cliente y orden
    doc.fontSize(12).text(`Fecha: ${order.date.toISOString().split("T")[0]}`, {
      align: "left",
    });
    doc.text(`Cliente: ${order.client}`);
    doc.text(`CUIL: ${order.cuil}`);
    doc.text(`Email: ${order.email}`);
    doc.text(`Condición de IVA: ${order.taxpayer}`);
    doc.moveDown();

    // Tabla de productos
    doc.fontSize(14).text("Productos:", { underline: true });
    const tableTop = doc.y + 10;
    const columnGap = 20;

    doc.fontSize(12).text("Producto", 50, tableTop);
    doc.text("Cantidad", 200, tableTop);
    doc.text("Precio", 300, tableTop);
    doc.text("Subtotal", 400, tableTop);

    let y = tableTop + 20;

    order.product.forEach((item) => {
      const subtotal = item.price * item.quantity;
      doc.text(item.name, 50, y);
      doc.text(item.quantity.toString(), 200, y);
      doc.text(`$${item.price.toFixed(2)}`, 300, y);
      doc.text(`$${subtotal.toFixed(2)}`, 400, y);
      y += 20;
    });

    // Total
    y += 10;
    doc
      .fontSize(14)
      .text(`Total: $${order.total.toFixed(2)}`, 400, y, { align: "right" });

    doc.end();
  });
};

const mailing = async (order) => {
  try {
    const trasporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: config.userEmail,
        pass: config.passwordEmail,
      },
    });

    const mailOptions = {
      from: config.userEmail,
      to: order.email,
      subject: `Remito #${order.serie}`,
      text: `Hola ${order.client}, adjunto el remito de tu compra.`,
      attachments: [
        {
          filename: `Remito-${order.serie}.pdf`,
          content: Buffer.from(order.attach, "base64"),
        },
      ],
    };

    const result = await trasporter.sendMail(mailOptions);
    logger.info(`Mail enviado con éxito`);
  } catch (error) {
    logger.error(`Error al enviar el mail: ${error.message}`);
  }
};

// -- Controllers

export const getAllOrdersController = async (req, res) => {
  try {
    const result = await getAllOrders();
    if (result.length === 0) {
      throw CustomError.createError({
        name: "Empty DB",
        message: "No se encontraron ordenes",
        code: EErrors.EMPTY_DB,
      });
    }
    logger.info("Ordenes obtenidas con éxito.");
    res.send({ result });
  } catch (error) {
    logger.error(`Error al obtener las ordenes: ${error.message}`);
    res.send({ message: error.message });
  }
};

export const getOrderByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getOrderById(id);
    if (!result) {
      throw CustomError.createError({
        name: "Not Found",
        message: "Orden no encontrada",
        code: EErrors.NOT_FOUND,
      });
    }

    logger.info("Orden obtenida con éxito.");
    res.send({ result });
  } catch (error) {
    logger.error(`Error al obtener la orden: ${error.message}`);
    res.send({ message: error.message });
  }
};

export const createOrderController = async (req, res) => {
  try {
    const { client, cuil, email, taxpayer, product } = req.body;

    const lastOrder = await getLastOrder();

    const newSerieNumber = lastOrder
      ? serieIncrement(lastOrder.serie)
      : `A-00000001`;

    const subtotal = product.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let total = product.reduce((acc, item) => {
      if (item.discount === 0) {
        return acc + item.price * item.quantity;
      } else {
        return acc + item.price * (1 - item.discount / 100) * item.quantity;
      }
    }, 0);

    if (taxpayer === "CONSUMIDOR FINAL") total = total * (1 + 21 / 100);
    if (taxpayer === "CONSUMIDOR FINAL - MAT. PRIMAS")
      total = total * (1 + 10.5 / 100);

    const order = {
      serie: newSerieNumber,
      date: new Date(),
      client,
      cuil,
      email,
      taxpayer,
      product,
      subtotal,
      total,
      status: true,
    };

    order.attach = await createHtmlPDF(order);

    const result = await createOrder(order);

    await mailing(order);

    logger.info("Orden creada con éxito.");
    res.send({ result });
  } catch (error) {
    logger.error(`Error al crear la orden: ${error.message}`);
    res.send({ message: error.message });
  }
};

export const viewPDFController = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await getOrderById(id);
    const pdf = order.attach;
    logger.info("PDF obtenido");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="archivo.pdf"');
    res.send(pdf);
  } catch (error) {
    logger.error(`Error al visualizar el PDF: ${error.message}`);
    res.send({ message: error.message });
  }
};

export const regeneratePDF = async (req, res) => {
  try {
    const { id } = req.params;
    let order = await getOrderById(id);
    order.attach = await createHtmlPDF(order);
    await updateOrder(id, order);

    const pdf = order.attach;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="archivo.pdf"');
    res.send(pdf);
  } catch (error) {
    logger.error(`Error al visualizar el PDF: ${error.message}`);
    res.send({ message: error.message });
  }
};

// -- Preliminar
export const updateOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    const { client, cuil, email, product } = req.body;

    const update = {
      client,
      cuil,
      email,
      taxpayer,
      product,
    };

    const order = await getOrderById(id);
    logger.debug(`Orden encontrada: ${order}`);

    Object.assign(order, update);

    const result = await updateOrder(id, order);
    logger.info("Orden actualizada con éxito.");

    res.send({ result });
  } catch (error) {
    logger.error(`Error al actualizar la orden: ${error.message}`);
    res.send({ message: error.message });
  }
};

export const updateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (typeof status !== "boolean") {
      throw CustomError.createError({
        name: "Bad Request",
        message: "El estado debe ser un booleano",
        code: EErrors.BAD_REQUEST,
      });
    }

    await deleteAttachOrder(id);
    const result = await updateOrderStatus(id, status);

    logger.info("Estado de la orden actualizado con éxito.");
    res.send({ result });
  } catch (error) {
    logger.error(`Error al actualizar el estado de la orden: ${error.message}`);
    res.send({ message: error.message });
  }
};
