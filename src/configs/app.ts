interface Config {
  prefix: string;
  port: number;
  secret: string;
  google: {
    clientId: string;
    clientSecret: string;
    callbackURL?: string;
  };
  mail: {
    host: string;
    auth: {
      user: string;
      pass: string;
    };
    port?: number;
    from?: string;
  };
}
export const config = (): Config => ({
  prefix: process.env.PREFIX || '!',
  port: parseInt(process.env.PORT, 10) || 3000,
  secret: process.env.JWT_SECRET || 'secret',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3000/auth/google/callback',
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    auth: {
      user: process.env.MAIL_USER || '',
      pass: process.env.MAIL_PASS || 'topsecret',
    },
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    from: process.env.MAIL_FROM
      ? `"No Reply" <${process.env.MAIL_FROM}>`
      : '"No Reply" <royalfabrice1234@gmail.com>',
  },
});
