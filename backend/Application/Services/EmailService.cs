using System.Threading.Tasks;
using DMS.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MimeKit.Text;

namespace DMS.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string to, string subject, string htmlMessage)
        {
            var host = _configuration["Smtp:Host"];
            var portString = _configuration["Smtp:Port"];
            var user = _configuration["Smtp:User"];
            var pass = _configuration["Smtp:Pass"];
            var from = _configuration["Smtp:From"] ?? user;

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(user) || string.IsNullOrEmpty(pass))
            {
                // Fallback to console print if SMTP is not fully configured yet
                System.Console.WriteLine("---------------------------------------------------------");
                System.Console.WriteLine($"EMAIL SIMULATION FOR: {to}");
                System.Console.WriteLine($"Subject: {subject}");
                System.Console.WriteLine($"Body: {htmlMessage}");
                System.Console.WriteLine("---------------------------------------------------------");
                return;
            }

            int port = string.IsNullOrEmpty(portString) ? 587 : int.Parse(portString);

            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(from));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = htmlMessage };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(user, pass);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}
