// const TOKEN = 'SAYizjYEAzebPDWNfOPmQMIyFeeS';
const API_OFFER_URL = 'https://prod-189.westus.logic.azure.com:443/workflows/4572be4d12fb4ff2bf6920824582c582/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fnguZX-Pt6oxz05v1RqyC5cLmh6tYJmzZC_ftkBQpYo';
const API_PRICE_URL = 'https://prod-23.westus.logic.azure.com:443/workflows/a8b765292c904110bf5f7360edd65853/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dZsPgHIaop6jxQddGsiq6X20x7KspSqsQ1f5Fgvmk4A';
const TIMEOUT = 10000; // 10 seconds

// Store token and expiry time
const tokenData = {
  accessToken: null,
  validUntil: 0,
  fetchPromise: null,
};

async function fetchNewToken() {
  const response = await fetch('https://hook.app.workfrontfusion.com/f57qz9qxp04rlny3h97jwky9luukjgol');
  const data = await response.json();
  return {
    accessToken: data.access_token,
    validUntil: data.valid_until,
  };
}

async function getAccessToken() {
  const now = Date.now();

  // Check if the token is still valid
  if (tokenData.accessToken && tokenData.validUntil > now) {
    return tokenData.accessToken;
  }

  // If a fetch request is already in progress, wait for it to complete
  if (tokenData.fetchPromise) {
    await tokenData.fetchPromise;
  } else {
    // Otherwise, initiate a new fetch request
    tokenData.fetchPromise = fetchNewToken().then((data) => {
      tokenData.accessToken = data.accessToken;
      tokenData.validUntil = data.validUntil;
      tokenData.fetchPromise = null; // Clear the fetch promise once done
      return data.accessToken;
    }).catch((error) => {
      tokenData.fetchPromise = null; // Clear the fetch promise on error
      throw error;
    });

    await tokenData.fetchPromise;
  }

  return tokenData.accessToken;
}

// eslint-disable-next-line no-underscore-dangle
const _fetchWithTimeout = (url, options, timeout) => Promise.race([
  fetch(url, options),
  new Promise((_, reject) => { setTimeout(() => reject(new Error('Request timed out')), timeout); }),
]);

export const getOffer = async (name) => {
  const token = await getAccessToken();

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: token,
      'offer-name': name,
    }),
  };

  try {
    const response = await _fetchWithTimeout(API_OFFER_URL, requestOptions, TIMEOUT);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching offer:', error.message);
    throw error;
  }
};

export const getPrice = async () => {
  const token = await getAccessToken();

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: token,
    }),
  };

  try {
    const response = await _fetchWithTimeout(API_PRICE_URL, requestOptions, TIMEOUT);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching offer:', error.message);
    throw error;
  }
};
