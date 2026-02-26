/**
 * Servicio de Email para enviar códigos de verificación
 * Usa Nodemailer con Gmail (u otro proveedor SMTP)
 */

import nodemailer from 'nodemailer';

/**
 * Generar código de verificación de 6 dígitos
 */
export const generarCodigo = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Crear transporter de Nodemailer
 * Usa variables de entorno para configuración segura
 */
const crearTransporter = () => {
    // Modo desarrollo: mostrar código en consola
    if (process.env.NODE_ENV !== 'production') {
        return {
            sendMail: async (mailOptions) => {
                console.log(`
╔════════════════════════════════════════════════════════════╗
║              CÓDIGO DE VERIFICACIÓN (DESARROLLO)          ║
╠════════════════════════════════════════════════════════════╣
║ Para:     ${mailOptions.to.padEnd(50)}
║ Asunto:   ${mailOptions.subject.padEnd(50)}
║ Cuerpo:   ${mailOptions.html.substring(0, 40).padEnd(50)}...
╚════════════════════════════════════════════════════════════╝
                `);
                return { messageId: 'mock-' + Date.now() };
            }
        };
    }

    // Producción: configurar Nodemailer
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

/**
 * Enviar código de verificación por email
 * @param {string} email - Email del destinatario
 * @param {string} nombre - Nombre del usuario
 * @param {string} codigo - Código de verificación de 6 dígitos
 */
export const enviarCodigoVerificacion = async (email, nombre, codigo) => {
    try {
        const transporter = crearTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@aldia.com',
            to: email,
            subject: 'Código de Verificación - Al Día',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                        .header { background: linear-gradient(to right, #2563eb, #1d4ed8); color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 28px; }
                        .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
                        .body { padding: 30px 20px; }
                        .body h2 { color: #1f2937; font-size: 18px; margin: 0 0 15px 0; }
                        .body p { color: #4b5563; line-height: 1.6; margin: 10px 0; }
                        .code-box { background: #f0f9ff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                        .code-box .code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2563eb; font-family: 'Courier New', monospace; }
                        .code-box .expiry { font-size: 12px; color: #6b7280; margin-top: 10px; }
                        .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
                        .footer a { color: #2563eb; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Verifica tu Cuenta</h1>
                            <p>Al Día - Servicios Inteligentes</p>
                        </div>
                        
                        <div class="body">
                            <h2>Hola ${nombre},</h2>
                            <p>¡Bienvenido a Al Día! Para completar tu registro, necesitas verificar tu correo electrónico.</p>
                            
                            <p><strong>Tu código de verificación es:</strong></p>
                            
                            <div class="code-box">
                                <div class="code">${codigo}</div>
                                <div class="expiry">✓ Este código es válido por 15 minutos</div>
                            </div>
                            
                            <p>Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
                            
                            <p style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 13px;">
                                Este es un mensaje automático. Por favor no responderlo.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>© 2024 Al Día. Todos los derechos reservados.</p>
                            <p><a href="https://aldia.com">Visita nuestra web</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado:', info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando email:', error.message);
        throw new Error(`No se pudo enviar el email: ${error.message}`);
    }
};

    /**
     * Enviar código de recuperación de contraseña por email
     * @param {string} email - Email del destinatario
     * @param {string} nombre - Nombre del usuario
     * @param {string} codigo - Código de recuperación (OTP)
     */
    export const enviarCodigoRecuperacion = async (email, nombre, codigo) => {
        try {
            const transporter = crearTransporter();

            const mailOptions = {
                from: process.env.EMAIL_USER || 'noreply@aldia.com',
                to: email,
                subject: 'Recuperación de Contraseña - Al Día',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
                            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                            .header { background: linear-gradient(to right, #2563eb, #1d4ed8); color: white; padding: 30px 20px; text-align: center; }
                            .body { padding: 30px 20px; }
                            .code-box { background: #fff7ed; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                            .code { font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #d97706; font-family: 'Courier New', monospace; }
                            .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🔒 Recuperación de Contraseña</h1>
                                <p>Al Día - Servicios Inteligentes</p>
                            </div>
                            <div class="body">
                                <h2>Hola ${nombre},</h2>
                                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código para continuar:</p>
                                <div class="code-box">
                                    <div class="code">${codigo}</div>
                                    <div class="expiry">✓ Este código es válido por 60 minutos</div>
                                </div>
                                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                            </div>
                            <div class="footer">
                                <p>© 2024 Al Día. Si necesitas ayuda, contacta soporte.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email de recuperación enviado:', info.messageId || info.response);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error enviando email de recuperación:', error.message);
            throw new Error(`No se pudo enviar el email de recuperación: ${error.message}`);
        }
    };
