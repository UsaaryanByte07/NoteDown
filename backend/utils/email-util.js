const { sendEmail } = require("../config/email_config");

const sendOtpEmail = async (to, firstName, lastName, otp) => {
  try {
    await sendEmail(
      to,
      "Welcome to NoteDown - Verify Your Email",
      `
            <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NoteDown</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #0f172a; margin: 0; padding: 40px 20px; background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); }
        .wrapper { max-width: 600px; margin: 0 auto; }
        .container { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); }
        .header { background: transparent; color: #0f172a; padding: 40px 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 800; color: #6d28d9; }
        .header .subtitle { font-size: 18px; margin-top: 10px; color: #475569; font-weight: 500; }
        .content { padding: 20px 40px 40px; }
        .content h2 { color: #0f172a; margin-bottom: 20px; font-size: 24px; font-weight: 800; }
        .content p { margin-bottom: 15px; font-size: 16px; line-height: 1.6; color: #1e293b; font-weight: 500;}
        .otp-container { background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(255, 255, 255, 0.6); color: #0f172a; padding: 30px; border-radius: 16px; text-align: center; margin: 30px 0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
        .otp-label { font-size: 14px; margin-bottom: 10px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
        .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 12px; font-family: 'Courier New', monospace; margin: 10px 0; color: #6d28d9; }
        .expiry-notice { background-color: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 12px; padding: 15px; margin: 20px 0; color: #0f172a; text-align: center; font-weight: 600; font-size: 15px;}
        .steps { background-color: rgba(255, 255, 255, 0.5); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 16px; padding: 25px; margin: 25px 0; }
        .steps h3 { margin-top: 0; color: #6d28d9; font-size: 18px; font-weight: 800; }
        .steps ol { margin: 0; padding-left: 20px; color: #1e293b; font-weight: 600;}
        .steps li { margin-bottom: 10px; font-size: 15px; }
        .benefits { margin: 25px 0; padding: 25px; background: rgba(255, 255, 255, 0.5); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.3); }
        .benefits h3 { color: #6d28d9; font-size: 18px; margin-bottom: 15px; font-weight: 800;}
        .benefits ul { margin: 0; padding-left: 20px; color: #1e293b; font-weight: 600;}
        .benefits li { margin-bottom: 10px; font-size: 15px; }
        .footer { background-color: transparent; padding: 30px; text-align: center; font-size: 14px; color: #475569; border-top: 1px solid rgba(255, 255, 255, 0.4); }
        .logo { font-size: 32px; font-weight: 900; margin-bottom: 8px; color: #6d28d9; letter-spacing: -1px; }
        .divider { height: 1px; background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent); margin: 30px 0; }
        .welcome-icon { font-size: 56px; margin-bottom: 15px; text-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="logo">📝 NoteDown</div>
                <div class="welcome-icon">✨</div>
                <h1>Welcome ${firstName}!</h1>
                <div class="subtitle">Your AI-powered notes assistant</div>
            </div>
            
            <div class="content">
                <h2>Almost there! Let's verify your email</h2>
                
                <p>Hi ${firstName} ${lastName},</p>
                
                <p>We're thrilled to have you join NoteDown! To complete your account setup and ensure the security of your account, please verify your email address using the verification code below:</p>
                
                <div class="otp-container">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="expiry-notice">
                    <strong>⏰ Important:</strong> This verification code will expire in <strong>5 minutes</strong> for your account security.
                </div>
                
                <div class="steps">
                    <h3>📝 How to verify your email:</h3>
                    <ol>
                        <li>Return to the verification page in your browser</li>
                        <li>Enter the 6-digit code: <strong style="color: #6d28d9;">${otp}</strong></li>
                        <li>Click "Verify Email" to complete your registration</li>
                    </ol>
                </div>
                
                <div class="divider"></div>
                
                <div class="benefits">
                    <h3>🌟 Once verified, you'll be able to:</h3>
                    <ul>
                        <li><strong>Upload Notes:</strong> Securely store your study materials</li>
                        <li><strong>AI Summaries:</strong> Get quick overviews of long documents</li>
                        <li><strong>Smart Querying:</strong> Ask questions and chat with your notes</li>
                        <li><strong>Organize:</strong> Keep your knowledge base in one place</li>
                    </ul>
                </div>
                
                <div class="divider"></div>
                
                <p><strong>Didn't create an account?</strong></p>
                <p>If you didn't sign up for NoteDown, please ignore this email. No account will be created without verification.</p>
            </div>
            
            <div class="footer">
                <p><strong style="color:#0f172a;">Welcome to NoteDown!</strong><br>
                <em>The NoteDown Team</em></p>
                <p style="font-size: 12px; color: #64748b; margin-top: 15px;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
            `,
    );
  } catch (err) {
    console.log(err.message);
  }
};

const sendForgotPasswordEmail = async (to, token) => {
  try {
    await sendEmail(
      to,
      "Reset Your NoteDown Password",
      `
            <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #0f172a; margin: 0; padding: 40px 20px; background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;}
        .wrapper { max-width: 600px; width: 100%; margin: 0 auto; }
        .container { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); }
        .header { background: transparent; color: #0f172a; padding: 40px 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: #6d28d9; }
        .content { padding: 20px 40px 40px; }
        .content h2 { color: #0f172a; margin-bottom: 20px; font-size: 22px; font-weight: 800;}
        .content p { margin-bottom: 15px; font-size: 16px; line-height: 1.6; color: #1e293b; font-weight: 500;}
        .button-container { text-align: center; margin: 35px 0; }
        .reset-button { display: inline-block; background: #6d28d9; color: white !important; padding: 16px 36px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(109, 40, 217, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); }
        .reset-button:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(109, 40, 217, 0.4); }
        .security-notice { background-color: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 12px; padding: 15px; margin: 25px 0; color: #0f172a; font-weight: 600; text-align: center;}
        .footer { background-color: transparent; padding: 30px; text-align: center; font-size: 14px; color: #475569; border-top: 1px solid rgba(255, 255, 255, 0.4); }
        .logo { font-size: 32px; font-weight: 900; margin-bottom: 10px; color: #6d28d9; letter-spacing: -1px;}
        .divider { height: 1px; background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent); margin: 30px 0; }
        .link-box { word-break: break-all; background-color: rgba(255, 255, 255, 0.5); border: 1px solid rgba(255, 255, 255, 0.3); color: #475569; padding: 12px; border-radius: 10px; font-family: monospace; font-size: 13px; font-weight: 600;}
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="logo">📝 NoteDown</div>
                <h1>Password Reset Request</h1>
            </div>
            
            <div class="content">
                <h2>Hello! 👋</h2>
                
                <p>We received a request to reset the password for your NoteDown account associated with <strong style="color: #1a73e8;">${to}</strong>.</p>
                
                <p>To create a new password, simply click the button below:</p>
                
                <div class="button-container">
                    <a href="http://localhost:5173/reset-password?token=${token}&email=${to}" class="reset-button">
                        Reset My Password
                    </a>
                </div>
                
                <div class="security-notice">
                    <strong>⚠️ Security Notice:</strong> This link will expire in <strong>5 minutes</strong> for your account security.
                </div>
                
                <div class="divider"></div>
                
                <p><strong>Didn't request a password reset?</strong></p>
                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged and your account is secure.</p>
                
                <p>If you're having trouble clicking the button above, copy and paste the following link into your browser:</p>
                <div class="link-box">
                    http://localhost:5173/reset-password?token=${token}&email=${to}
                </div>
            </div>
            
            <div class="footer">
                <p><strong style="color:#0f172a;">Best regards,</strong><br>
                <em>The NoteDown Team</em></p>
                <p style="font-size: 12px; color: #64748b; margin-top: 15px;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
            `,
    );
  } catch (err) {
    console.log(err.message);
  }
};

const sendWelcomeAdminEmail = async (to, firstName, lastName) => {
  try {
    await sendEmail(
      to,
      "Welcome to NoteDown Admin Team",
      `
            <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NoteDown Admin Team</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #0f172a; margin: 0; padding: 40px 20px; background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;}
        .wrapper { max-width: 600px; width: 100%; margin: 0 auto; }
        .container { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); }
        .header { background: transparent; color: #0f172a; padding: 40px 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: #6d28d9; }
        .content { padding: 20px 40px 40px; }
        .content h2 { color: #0f172a; margin-bottom: 20px; font-size: 22px; font-weight: 800;}
        .content p { margin-bottom: 15px; font-size: 16px; line-height: 1.6; color: #1e293b; font-weight: 500;}
        .button-container { text-align: center; margin: 35px 0; }
        .reset-button { display: inline-block; background: #6d28d9; color: white !important; padding: 16px 36px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(109, 40, 217, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); }
        .reset-button:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(109, 40, 217, 0.4); }
        .security-notice { background-color: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 12px; padding: 15px; margin: 25px 0; color: #0f172a; font-weight: 600; text-align: center;}
        .footer { background-color: transparent; padding: 30px; text-align: center; font-size: 14px; color: #475569; border-top: 1px solid rgba(255, 255, 255, 0.4); }
        .logo { font-size: 32px; font-weight: 900; margin-bottom: 10px; color: #6d28d9; letter-spacing: -1px;}
        .divider { height: 1px; background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent); margin: 30px 0; }
        .link-box { word-break: break-all; background-color: rgba(255, 255, 255, 0.5); border: 1px solid rgba(255, 255, 255, 0.3); color: #475569; padding: 12px; border-radius: 10px; font-family: monospace; font-size: 13px; font-weight: 600;}
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="logo">📝 NoteDown</div>
                <h1>Welcome to NoteDown Admin Team</h1>
            </div>
            
            <div class="content">
                <h2>Hello ${firstName} ${lastName}! 👋</h2>
                
                <p>You have been added as an admin to the NoteDown platform. We're excited to have you on the team!</p>
                
                <p>Welcome aboard! If you have any questions or need assistance, feel free to reach out.</p>
            </div>
            
            <div class="footer">
                <p><strong style="color:#0f172a;">Best regards,</strong><br>
                <em>The NoteDown Team</em></p>
                <p style="font-size: 12px; color: #64748b; margin-top: 15px;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
            `,
    );
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  sendOtpEmail,
  sendForgotPasswordEmail,
  sendWelcomeAdminEmail,
};
