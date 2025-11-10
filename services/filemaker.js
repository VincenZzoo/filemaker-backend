// services/filemaker.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const { FM_HOST, FM_DATABASE, FM_USERNAME, FM_PASSWORD, FM_LAYOUT } = process.env;

let sessionToken = null;

async function loginFileMaker() {
  const url = `${FM_HOST}/fmi/data/vLatest/databases/${FM_DATABASE}/sessions`;
  const res = await axios.post(url, {}, {
    auth: { username: FM_USERNAME, password: FM_PASSWORD }
  });
  sessionToken = res.data.response.token;
  return sessionToken;
}

export async function findRecordByEmail(email) {
  if (!sessionToken) await loginFileMaker();

  try {
    const url = `${FM_HOST}/fmi/data/vLatest/databases/${FM_DATABASE}/layouts/${FM_LAYOUT}/_find`;
    const payload = { query: [{ email: `==${email}` }] };
    const res = await axios.post(url, payload, {
      headers: { 'Authorization': `Bearer ${sessionToken}` }
    });

    return res.data.response.data[0].fieldData;
  } catch (err) {
    // Retry once if session expired
    if (err.response?.status === 401) {
      sessionToken = null;
      return await findRecordByEmail(email);
    }
    console.error('FileMaker query error:', err.message);
    throw err;
  }
}
