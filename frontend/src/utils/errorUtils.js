/**
 * Converts technical error messages to user-friendly messages.
 * @param {Error} error - The error object from axios/api call.
 * @param {string} fallbackMessage - A default message if no specific match is found.
 * @returns {string} - The user-friendly error message.
 */
export const getFriendlyErrorMessage = (error, fallbackMessage = 'Unable to complete the request. Please try again.') => {
  if (!error.response) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  const status = error.response.status;
  const message = error.response.data?.message || '';

  if (status === 401) {
    return 'Invalid Register Number or Password.';
  }

  if (status === 409 || message.toLowerCase().includes('duplicate')) {
    return 'An account with this Register Number already exists.';
  }

  if (status === 500) {
    return 'Unable to complete the request. Please try again.';
  }

  return message || fallbackMessage;
};
