import { NextResponse } from 'next/server'
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; 
const landlordPhone = process.env.LANDLORD_PHONE_NUMBER; 

export async function GET(request) {
  try {
    // Vercel Cron secures the endpoint using the CRON_SECRET headers
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!accountSid || !authToken || !twilioPhoneNumber || !landlordPhone) {
      console.error("Twilio credentials or LANDLORD_PHONE_NUMBER missing. Cannot send reminder.");
      return NextResponse.json({ error: 'Configuration missing' }, { status: 400 });
    }

    const client = twilio(accountSid, authToken);
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.vercel.app';
    
    // Format landlord phone safely
    let phone = landlordPhone.trim();
    if (!phone.startsWith('+')) {
      if (phone.startsWith('91')) {
        phone = '+' + phone;
      } else {
        phone = '+91' + phone; 
      }
    }

    const msg = await client.messages.create({
      body: `It is the 1st of the month! Please click here to review and send all pending rent invoices: ${baseUrl}`,
      from: twilioPhoneNumber,
      to: `whatsapp:${phone}`,
    });

    return NextResponse.json({ success: true, messageSid: msg.sid });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
