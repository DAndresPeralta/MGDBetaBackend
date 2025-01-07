export const pdfTemplate = (order) => {
  return `
  <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Remito N° ${order.serie}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 12px;
        }
        .container {
            border: 1px solid #000;
            padding: 10px;
        }
        h1 {
            text-align: center;
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
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
        }
        .products-table th, .products-table td {
            border: 1px solid #000;
            padding: 5px;
            text-align: left;
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
    </style>
</head>
<body>
    <div class="container">
        <h1>REMITO</h1>
        <div class="header">
            <div>
                <p><strong>EMPRESA S.A.</strong></p>
                <p>Calle Ejemplo 123, Ciudad</p>
                <p>CUIT: XX-XXXXXXXX-X</p>
            </div>
            <div>
                <p><strong>Remito N°:</strong> ${order.serie}</p>
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
                    <th>Cantidad</th>
                    <th>Descripción</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${order.product
                  .map(
                    (item) => `
                    <tr>
                        <td>${item.quantity}</td>
                        <td>${item.name}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>$${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>

        <p class="total">Total: $${order.total.toFixed(2)}</p>

        <div class="footer">
            <p>Este remito no tiene validez como factura</p>
        </div>
    </div>
</body>
</html>
  `;
};
