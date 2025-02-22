// -- Services
import {
  createOrder,
  getLastOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteAttachOrder,
  getOrderAttachById,
} from "../services/order.services.js";
import {
  deleteOrderFromClient,
  getClientById,
} from "../services/client.services.js";

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

const totalPrice = (product, taxpayer) => {
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

  return total;
};

const createHtmlPDF = async (order) => {
  try {
    const options = {
      format: "A4",
      border: "3mm",
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

const refactDate = (date) => {
  const [day, month, year] = date.split("/");
  return new Date(`${month}/${day}/${year}`);
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

const mailing = async (order, attach) => {
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
      to: order.client.email,
      subject: `Remito #${order.serie}`,
      text: `Hola ${order.client.companyName}, adjunto el comprobante de tu compra.`,
      attachments: [
        {
          filename: `Comprobante-${order.serie}.pdf`,
          content: Buffer.from(attach, "base64"),
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
        message: "No se encontraron clientes",
        code: EErrors.EMPTY_DB.code,
        httpCode: EErrors.EMPTY_DB.httpCode,
      });
    }
    logger.info("Ordenes obtenidas con éxito.");
    res.status(200).send({ result });
  } catch (error) {
    logger.error(`Error al obtener las ordenes: ${error.message}`);
    const statusCode = error.httpCode || 500;
    res.status(statusCode).send({ message: error.message, code: error.code });
  }
};

export const getOrderByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getOrderById(id);
    if (!result) {
      throw CustomError.createError({
        name: "Not Found",
        message: "No se encontró el cliente",
        code: EErrors.NOT_FOUND.code,
        httpCode: EErrors.NOT_FOUND.httpCode,
      });
    }

    logger.info("Orden obtenida con éxito.");
    res.status(200).send({ result });
  } catch (error) {
    logger.error(`Error al obtener la orden: ${error.message}`);
    const statusCode = error.httpCode || 500;
    res.status(statusCode).send({ message: error.message, code: error.code });
  }
};

export const createOrderController = async (req, res) => {
  try {
    const { clientId, date, product, sendEmail } = req.body;

    // Traigo la ultima orden para incrementar la serie
    const lastOrder = await getLastOrder();
    // Traigo el cliente seleccionado por el front para asignar a la orden - Pushear
    const findClient = await getClientById(clientId);

    if (!findClient) {
      throw CustomError.createError({
        name: "Not Found",
        message: "No se encontró el cliente",
        code: EErrors.NOT_FOUND.code,
        httpCode: EErrors.NOT_FOUND.httpCode,
      });
    }

    const newSerieNumber = lastOrder
      ? serieIncrement(lastOrder.serie)
      : `A-00000001`;

    const subtotal = product.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let total = totalPrice(product, findClient.taxpayer);

    const order = {
      serie: newSerieNumber,
      date: date ? new Date(refactDate(date)) : new Date(),
      client: findClient._id, // Asigno el cliente a la orden - Pushear
      product,
      subtotal,
      total,
      status: true,
    };

    // Creo un objeto con los datos de la order mas los datos del cliente para enviarlos a createHtmlPDF
    const orderPdf = {
      ...order,
      client: {
        companyName: findClient.companyName,
        email: findClient.email,
        cuil: findClient.cuil,
        address: findClient.address,
        taxpayer: findClient.taxpayer,
      },
    };

    // Creo el PDF
    order.attach = await createHtmlPDF(orderPdf);

    const result = await createOrder(order);

    // Referencio en el cliente la orden para luego acceder a sus datos con populate - Pushear
    findClient.orders.push(result._id);
    await findClient.save();

    // Envio opcional de mail
    if (sendEmail === true) await mailing(orderPdf, order.attach);

    logger.info("Orden creada con éxito.");
    res.status(200).send({ result });
  } catch (error) {
    logger.error(`Error al crear la orden: ${error.message}`);
    const statusCode = error.httpCode || 500;
    res.status(statusCode).send({ message: error.message, code: error.code });
  }
};

export const viewPDFController = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order with special service
    const order = await getOrderAttachById(id);
    // Get attach from order
    const pdf = order.attach;
    logger.info("PDF obtenido");
    // Renderize config
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
    // Get order from DB call
    let order = await getOrderById(id);
    // Create pdf and adding to attach atribute
    order.attach = await createHtmlPDF(order);
    // Persiste order with attach pdf created
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
    // Order Id
    const { id } = req.params;
    // clientId = Id Client
    const { clientId, date, product, sendEmail } = req.body;

    // Traigo el cliente seleccionado por el front para asignar a la orden - Pushear
    const findClient = await getClientById(clientId);

    // Delete old attach from order to update
    await deleteAttachOrder(id);

    const subtotal = product.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let total = totalPrice(product, findClient.taxpayer);

    const update = {
      date: date ? new Date(refactDate(date)) : new Date(),
      client: findClient._id,
      product,
      subtotal,
      total,
    };

    // Get old order from DB call
    const order = await getOrderById(id);
    // Delete old order from client model
    await deleteOrderFromClient(order.client._id, id);

    // Record by warn logger the order to update, to get a register
    logger.warn(
      `Orden encontrada para modificar: ${JSON.stringify(order, null, 2)}}`
    );

    // Merge old order with update order object
    Object.assign(order, update);

    // Creo un objeto con los datos de la order mas los datos del cliente para enviarlos a createHtmlPDF
    const orderPdf = {
      ...order,
      client: {
        companyName: findClient.companyName,
        email: findClient.email,
        cuil: findClient.cuil,
        taxpayer: findClient.taxpayer,
      },
    };

    // Attach new order to new client
    findClient.orders.push(id);
    await findClient.save();

    if (sendEmail === true) {
      order.attach = await createHtmlPDF(orderPdf);
      await mailing(orderPdf, order.attach);
    }

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
