export const pdf2Template = (order) => {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comprobante N° ${order.serie}</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
            margin-bottom: 30mm; /* Margen inferior más grande */
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 5px;
            font-size: 8px;
        }
        .container {
            border: 1px solid #000;
            padding: 7px;
            max-width: 800px;
            margin: 1rem auto;
        }
        h1 {
            text-align: center;
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .header .logo {
            max-width: 100px;
            max-height: 100px;
        }
        .header .company-info {
            flex-grow: 1;
            margin-left: 20px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .info-table th, .info-table td {
            border: 1px solid #000;
            padding: 5px;
            text-align: left;
        }
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .products-table th, .products-table td {
            border: 1px solid #000;
            padding: 5px;
            text-align: right;
            overflow: hidden;
            word-wrap: break-word;
            font-size: 7px; /* Reducir el tamaño de la fuente */
        }
        .products-table tr {
            page-break-inside: avoid; /* Evitar que las filas se corten */
        }
        .total {
            text-align: right;
            font-weight: bold;
            margin-top: 10px;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-style: italic;
        }
        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        .signature {
            text-align: center;
            width: 40%;
        }
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 50px;
            padding-top: 5px;
        }
        .page-break {
            page-break-before: always; /* Forzar salto de página */
        }
        @media (max-width: 600px) {
            .header, .signatures {
                flex-direction: column;
            }
            .signature {
                width: 100%;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>COMPROBANTE</h1>
        <div class="header">
            <img src="/assets/LOGO-CHIPI.svg" alt="Logo de la empresa" class="logo" />
            <div class="company-info">
                <p><strong>EMPRESA S.A.</strong></p>
                <p>Calle Ejemplo 123, Ciudad</p>
                <p>CUIT: XX-XXXXXXXX-X</p>
            </div>
            <div>
                <p><strong>Comprobante N°:</strong> ${order.serie}</p>
                <p><strong>Fecha:</strong> ${
                  order.date.toISOString().split("T")[0]
                }</p>
            </div>
        </div>
        
        <table class="info-table">
            <tr>
                <th>Cliente:</th>
                <td>${order.client}</td>
                <th>CUIL/CUIT:</th>
                <td>${order.cuil}</td>
            </tr>
            <tr>
                <th>Domicilio:</th>
                <td colspan="3"></td>
            </tr>
            <tr>
                <th>Condición IVA:</th>
                <td>${order.taxpayer}</td>
                <th>Email:</th>
                <td>${order.email}</td>
            </tr>
        </table>

        <table class="products-table">
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th>Precio Unitario</th>
                    <th>Cantidad</th>
                    <th>Sub Total</th>
                    <th>% Desc</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.product
                  .map(
                    (item) => `
                    <tr>
                        <td>${item.name}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.price * item.quantity}</td>
                        <td>${item.discount || 0}%</td>
                        <td>$${(
                          item.price *
                          item.quantity *
                          (1 - (item.discount || 0) / 100)
                        ).toFixed(2)}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>

        <p class="total">Precio Final: $${order.total.toFixed(2)}</p>

        <div class="signatures">
            <div class="signature">
                <div class="signature-line">Firma del Emisor</div>
            </div>
            <div class="signature">
                <div class="signature-line">Firma del Cliente</div>
            </div>
        </div>

        <div class="footer">
            <p>Este comprobante no tiene validez como factura</p>
        </div>
    </div>
</body>
</html>`;
};
