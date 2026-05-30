import { NextRequest, NextResponse } from 'next/server';

// 邮件验证函数
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 模拟数据库存储（实际项目中应该使用真实数据库）
const subscribers = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 验证邮件地址
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // 检查是否已经订阅
    if (subscribers.has(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    // 模拟添加到邮件服务（例如 Mailchimp, ConvertKit 等）
    try {
      // 这里是你可以集成真实邮件服务的地方
      await simulateEmailService(email);
      
      // 添加到本地存储
      subscribers.add(email.toLowerCase());
      
      // 记录日志
      console.log(`New subscriber: ${email}`);
      
      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed to newsletter!',
        email: email
      });

    } catch (serviceError) {
      console.error('Email service error:', serviceError);
      return NextResponse.json(
        { error: 'Failed to subscribe to email service' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 获取订阅列表（可选，用于管理）
export async function GET() {
  return NextResponse.json({
    total: subscribers.size,
    // 不返回实际邮件地址以保护隐私
    message: `Total subscribers: ${subscribers.size}`
  });
}

// 模拟邮件服务集成
async function simulateEmailService(email: string): Promise<void> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 这里可以集成实际的邮件服务
  // 例如：
  /*
  // Mailchimp 集成示例
  const response = await fetch('https://us1.api.mailchimp.com/3.0/lists/LIST_ID/members', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed',
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add subscriber to Mailchimp');
  }
  */
  
  // 发送欢迎邮件（模拟）
  await sendWelcomeEmail(email);
}

// 发送欢迎邮件（模拟）
async function sendWelcomeEmail(email: string): Promise<void> {
  // 这里可以集成邮件发送服务，如 SendGrid, Resend, 或 Nodemailer
  console.log(`Welcome email sent to: ${email}`);
  
  /*
  // SendGrid 集成示例
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: email,
    from: 'hello@delix.com',
    subject: 'Welcome to DELIX Universe!',
    text: 'Thank you for subscribing to our newsletter!',
    html: '<strong>Welcome to the Runaway Rabbit Universe!</strong>',
  };
  
  await sgMail.send(msg);
  */
}