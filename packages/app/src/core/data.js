import fetch from 'node-fetch';

export async function platformApi(url, options = {}, retries = 0) {
  if (retries > 3) {
    throw new Error(`Request timed out, try again later`);
  }
  if (!process.env.SCOUT9_API_KEY) {
    throw new Error('Missing required environment variable "SCOUT9_API_KEY"');
  }
  return fetch(url, {
    method: 'GET',
    ...options,
    headers: {
      'Authorization': process.env.SCOUT9_API_KEY || '',
      ...(options.headers || {})
    }
  }).then((res) => {
    if (res.status === 504) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(platformApi(url, options, retries + 1));
        }, 3000);
      });
    }
    return Promise.resolve(res);
  });
}
