# Mayur Technologies website (GitHub + Vercel + Resend)

This project includes a laptop-parts catalogue, enquiry cart, customer contact form and a Vercel serverless API that sends enquiries using Resend.

## 1. Upload this project to GitHub

1. Open your GitHub repository: `mayur-technologies-website`.
2. Choose **Add file → Upload files**.
3. Extract this ZIP on your computer first.
4. Open the extracted `mayur-technologies-resend` folder and select all files and folders inside it (`index.html`, `styles.css`, `app.js`, `api`, `package.json`, etc.).
5. Drag them into GitHub's upload area.
6. Enter commit message `Add Mayur Technologies website` and click **Commit changes**.

Important: `index.html` must be at the repository root, not inside an extra nested folder.

## 2. Deploy from Vercel

1. Return to the Vercel import page for `mayur-technologies-website`.
2. Keep Framework Preset as **Other** and Root Directory as `./`.
3. Click **Deploy**. Vercel will install the Resend package from `package.json`.
4. If you already opened the import screen before uploading files, refresh it after committing the files to GitHub.

## 3. Configure Resend

1. Create/sign in to a Resend account at https://resend.com/.
2. Add and verify a domain you own in Resend. Use an address on that verified domain as the sender, for example `Mayur Technologies <enquiry@yourdomain.com>`.
3. Create an API key in Resend.
4. In Vercel, open your project → **Settings → Environment Variables**.
5. Add these variables (Production, and Preview if you want preview deployments to send test mail):
   - `RESEND_API_KEY` = your Resend API key
   - `ENQUIRY_TO_EMAIL` = `mayurtech101@gmail.com`
   - `RESEND_FROM_EMAIL` = `Mayur Technologies <enquiry@your-verified-domain.com>`
6. Save the variables, then go to **Deployments** and redeploy the latest deployment so the function receives them.

Never put the Resend API key in `app.js`, `index.html`, or any public GitHub file. Do not share the API key in chat or screenshots.

Resend generally requires a verified sender domain to send production email to your own recipients. A Gmail inbox can receive the enquiries, but the sender address should be on a domain you have verified in Resend.

## 4. Test the enquiry

Open your Vercel deployment URL, add one or more products to the cart, enter a name and mobile number, then send an enquiry. Check `mayurtech101@gmail.com` and the spam folder.

## Notes

- Product catalogue entries are sample categories; update them in `app.js` to match your actual inventory.
- The form sends product names/categories and customer contact details. It does not display prices because prices have not been supplied.
- The API includes basic validation and a honeypot field. For a high-traffic public site, add stronger rate limiting or CAPTCHA.
